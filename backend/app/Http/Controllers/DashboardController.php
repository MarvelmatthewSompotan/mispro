<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\AuditLog;
use App\Models\SchoolYear;
use Illuminate\Http\Request;
use App\Models\ApplicationForm;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\CancelledRegistration;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    private function addCacheKey($key)
    {
        $keys = Cache::get('dashboard_keys', []);
        if (!in_array($key, $keys)) {
            $keys[] = $key;
            Cache::put('dashboard_keys', $keys, now()->addDays(30));
        }
    }

    public function forgetDashboardCacheByYear($yearStr)
    {
        $keys = Cache::get('dashboard_keys', []);
        $remaining = [];

        foreach ($keys as $key) {
            if (str_contains($key, $yearStr)) {
                Cache::forget($key);
            } else {
                $remaining[] = $key;
            }
        }

        Cache::put('dashboard_keys', $remaining, now()->addDays(30));
    }

    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $username = $user->username;

            $date = $request->query('date')
                ? Carbon::parse($request->query('date'))->toDateString()
                : Carbon::today()->toDateString();

            $startOfDay = Carbon::parse($date)->startOfDay();
            $endOfDay = Carbon::parse($date)->endOfDay();
            $yesterdayStart = Carbon::parse($date)->subDay()->startOfDay();
            $yesterdayEnd = Carbon::parse($date)->subDay()->endOfDay();

            $currentMonth = now()->month;
            $currentYear = now()->year;

            $schoolYearStr = ($currentMonth >= 7)
                ? $currentYear . '/' . ($currentYear + 1)
                : ($currentYear - 1) . '/' . $currentYear;

            $previousYearStr = ($currentMonth >= 7)
                ? ($currentYear - 1) . '/' . $currentYear
                : ($currentYear - 2) . '/' . ($currentYear - 1);
            
            $yearParts = explode('/', $schoolYearStr);
            $nextSchoolYearStr = ((int)$yearParts[1]) . '/' . (((int)$yearParts[1]) + 1);

            $schoolYears = SchoolYear::whereIn('year', [$schoolYearStr, $previousYearStr, $nextSchoolYearStr])
                ->pluck('school_year_id', 'year');

            $currentSchoolYearId = $schoolYears[$schoolYearStr] ?? null;
            $previousSchoolYearId = $schoolYears[$previousYearStr] ?? null;
            $nextSchoolYearId = $schoolYears[$nextSchoolYearStr] ?? null; 
            
            $lastCachedSchoolYear = Cache::get('last_cached_school_year');
            if ($lastCachedSchoolYear) {
                if ($lastCachedSchoolYear !== $schoolYearStr) {
                    $this->forgetDashboardCacheByYear($lastCachedSchoolYear);
                    Cache::forget('dashboard_meta_' . $user->user_id . '_' . $lastCachedSchoolYear);
                    Cache::put('last_cached_school_year', $schoolYearStr);
                    \Log::info('Dashboard meta cache invalidated due to new school year: ' . $schoolYearStr);
                }
            } else {
                Cache::put('last_cached_school_year', $schoolYearStr);
            }

            // CACHE 1: Meta Data
            $metaCacheKey = 'dashboard_meta_' . $user->user_id . '_' . $schoolYearStr;

            $meta = Cache::remember($metaCacheKey, now()->addHours(24), function () use ($user, $schoolYearStr, $previousYearStr, $schoolYears) {
                $lastLogin = AuditLog::where('action', 'login_success')
                    ->where('user_id', $user->user_id)
                    ->orderByDesc('created_at')
                    ->first();

                return [
                    'last_login' => $lastLogin ? $lastLogin->created_at->toDateTimeString() : null,
                    'current_school_year_name' => $schoolYearStr, 
                    'current_school_year_id' => $schoolYears[$schoolYearStr] ?? null, 
                    'previous_school_year_id' => $schoolYears[$previousYearStr] ?? null,
                ];
            });
            $this->addCacheKey($metaCacheKey);

            // CACHE 2: Statistik Data 
            $statCacheKey = 'dashboard_stats_' . $schoolYearStr . '_' . now()->format('Ymd');

            $stats = Cache::remember($statCacheKey, now()->addHours(24), function () use ($currentSchoolYearId, $previousSchoolYearId, $nextSchoolYearId, $startOfDay, $endOfDay, $yesterdayStart, $yesterdayEnd) {

                // Global Statistics
                $registrationStats = ApplicationForm::selectRaw('
                    COUNT(*) as total_registrations,
                    COUNT(CASE WHEN application_forms.status = "Confirmed" THEN 1 ELSE NULL END) as total_confirmed
                ')->first();

                $totalConfirmed = (int)$registrationStats->total_confirmed;
                
                $globalCancelledReturning = ApplicationForm::where('status', 'Cancelled')
                    ->count();
                $globalCancelledNew = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                    ->count();
                $totalCancelled = $globalCancelledReturning + $globalCancelledNew;
                
                $prevGlobalCancelledReturning = ApplicationForm::where('status', 'Cancelled')
                    ->where('updated_at', '<', $startOfDay)
                    ->count();
                $prevGlobalCancelledNew = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                    ->where('cancelled_at', '<', $startOfDay)
                    ->count();
                $prevGlobalTotalCancelled = $prevGlobalCancelledReturning + $prevGlobalCancelledNew;
                
                $totalRegistrations = (int)$registrationStats->total_registrations + $globalCancelledNew;
                    
                // Daily Statistics
                $dailyStats = ApplicationForm::selectRaw('
                    -- Today Stats
                    SUM(CASE WHEN created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS today_total_af,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS today_total_confirmed,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? AND enrollments.student_status = "New" THEN 1 ELSE 0 END) AS today_new_confirmed,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? AND enrollments.student_status = "Old" THEN 1 ELSE 0 END) AS today_returning_confirmed,

                    -- Yesterday Stats
                    SUM(CASE WHEN created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS yesterday_total_af,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS yesterday_total_confirmed,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? AND enrollments.student_status = "New" THEN 1 ELSE 0 END) AS yesterday_new_confirmed,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? AND enrollments.student_status = "Old" THEN 1 ELSE 0 END) AS yesterday_returning_confirmed
                ', [
                    $startOfDay, $endOfDay, $startOfDay, $endOfDay, $startOfDay, $endOfDay, $startOfDay, $endOfDay,
                    $yesterdayStart, $yesterdayEnd, $yesterdayStart, $yesterdayEnd, $yesterdayStart, $yesterdayEnd, $yesterdayStart, $yesterdayEnd
                ])
                ->join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                ->first();

                $todayCancelledReturning = ApplicationForm::where('status', 'Cancelled')
                    ->whereBetween('updated_at', [$startOfDay, $endOfDay])
                    ->count();
                $todayCancelledNew = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                    ->whereBetween('cancelled_at', [$startOfDay, $endOfDay])
                    ->count();
                $todayTotalCancelled = $todayCancelledReturning + $todayCancelledNew;

                $yesterdayCancelledReturning = ApplicationForm::where('status', 'Cancelled')
                    ->whereBetween('updated_at', [$yesterdayStart, $yesterdayEnd])
                    ->count();
                $yesterdayCancelledNew = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                    ->whereBetween('cancelled_at', [$yesterdayStart, $yesterdayEnd])
                    ->count();
                $yesterdayTotalCancelled = $yesterdayCancelledReturning + $yesterdayCancelledNew;

                // Yearly Statistics
                // ... existing code ...
                // Yearly Statistics
                $yearlyStats = ApplicationForm::join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                    ->selectRaw('
                        -- Total All SY
                        SUM(CASE WHEN enrollments.school_year_id = ? THEN 1 ELSE 0 END) AS sy_total_af,
                        SUM(CASE WHEN enrollments.school_year_id = ? THEN 1 ELSE 0 END) AS sy_total_previous_af,

                        -- Confirmed SY
                        SUM(CASE WHEN enrollments.school_year_id = ? AND application_forms.status = "Confirmed" THEN 1 ELSE 0 END) AS sy_total_confirmed,
                        SUM(CASE WHEN enrollments.school_year_id = ? AND application_forms.status = "Confirmed" THEN 1 ELSE 0 END) AS sy_total_confirmed_previous,
                        
                        -- Confirmed New/Returning SY (CURRENT)
                        SUM(CASE WHEN enrollments.school_year_id = ? AND application_forms.status = "Confirmed" AND enrollments.student_status = "New" THEN 1 ELSE 0 END) AS sy_new_confirmed,
                        SUM(CASE WHEN enrollments.school_year_id = ? AND application_forms.status = "Confirmed" AND enrollments.student_status = "Old" THEN 1 ELSE 0 END) AS sy_returning_confirmed,
                        
                        -- Confirmed New/Returning Previous SY (PREVIOUS)
                        SUM(CASE WHEN enrollments.school_year_id = ? AND application_forms.status = "Confirmed" AND enrollments.student_status = "New" THEN 1 ELSE 0 END) AS sy_new_confirmed_previous,
                        SUM(CASE WHEN enrollments.school_year_id = ? AND application_forms.status = "Confirmed" AND enrollments.student_status = "Old" THEN 1 ELSE 0 END) AS sy_returning_confirmed_previous
                    ', [
                        $currentSchoolYearId,   
                        $previousSchoolYearId, 

                        $currentSchoolYearId,   
                        $previousSchoolYearId,  

                        $currentSchoolYearId,   
                        $currentSchoolYearId,   

                        $previousSchoolYearId,  
                        $previousSchoolYearId 
                    ])
                    ->whereIn('enrollments.school_year_id', array_filter([$currentSchoolYearId, $previousSchoolYearId]))
                    ->first();

                $syCancelledNew = 0;
                $syCancelledReturning = 0;
                
                if ($currentSchoolYearId) {
                    $syCancelledNew = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                        ->where('school_year_id', $currentSchoolYearId)
                        ->count();
                    
                    $syCancelledReturning = ApplicationForm::where('application_forms.status', 'Cancelled')
                        ->join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                        ->where('enrollments.school_year_id', $currentSchoolYearId)
                        ->count();
                }

                $syTotalCancelled = $syCancelledNew + $syCancelledReturning;

                $prevSyCancelledNew = 0;
                $prevSyCancelledReturning = 0;

                if ($previousSchoolYearId) {
                    $prevSyCancelledNew = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                        ->where('school_year_id', $previousSchoolYearId)
                        ->count();
                    
                    $prevSyCancelledReturning = ApplicationForm::where('application_forms.status', 'Cancelled')
                        ->join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                        ->where('enrollments.school_year_id', $previousSchoolYearId)
                        ->count();
                }

                $prevSyTotalCancelled = $prevSyCancelledNew + $prevSyCancelledReturning;

                // Total Pre-Registers for Next School Year
                $totalPreRegisters = 0;
                if ($nextSchoolYearId) {
                    $totalPreRegisters = ApplicationForm::where('application_forms.status', 'Confirmed')
                        ->join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                        ->where('enrollments.school_year_id', $nextSchoolYearId)
                        ->count();
                }

                // Total Active Students by Section
                $sectionKeys = ['ecp' => 'ECP', 'elementary' => 'Elementary School', 'middle' => 'Middle School', 'high' => 'High School'];
                $activeStudentsBySection = array_fill_keys(array_keys($sectionKeys), 0);

                if ($currentSchoolYearId) {
                    $activeStudentsData = DB::table('students')
                        ->select(
                            'sections.name as section_name', 
                            DB::raw('COUNT(DISTINCT students.id) as total_active')
                        )
                        ->join('enrollments', 'enrollments.id', '=', 'students.id')
                        ->join('application_forms', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                        ->join('sections', 'enrollments.section_id', '=', 'sections.section_id')
                        ->where('students.status', 'Not Graduate')
                        ->where('students.active', 'YES')
                        ->where('application_forms.status', 'Confirmed')
                        ->where('enrollments.school_year_id', $currentSchoolYearId)
                        ->groupBy('sections.name')
                        ->get();

                    foreach ($activeStudentsData as $data) {
                        $normalizedName = strtolower($data->section_name);
                        
                        if (str_contains($normalizedName, 'ecp')) {
                            $activeStudentsBySection['ecp'] = $data->total_active;
                        } elseif (str_contains($normalizedName, 'elementary')) {
                            $activeStudentsBySection['elementary'] = $data->total_active;
                        } elseif (str_contains($normalizedName, 'middle')) {
                            $activeStudentsBySection['middle'] = $data->total_active;
                        } elseif (str_contains($normalizedName, 'high')) {
                            $activeStudentsBySection['high'] = $data->total_active;
                        }
                    }
                }

                // Total Global Registration & Growth
                $prevTotalRegistrations = ApplicationForm::where('created_at', '<', $startOfDay)->count(); 
                $totalRegistrationGrowth = $prevTotalRegistrations > 0 ? round((($totalRegistrations - $prevTotalRegistrations) / $prevTotalRegistrations) * 100, 2) : 0;

                $prevTotalConfirmed = ApplicationForm::where('status', 'Confirmed')->where('created_at', '<', $startOfDay)->count();
                $totalConfirmedGrowth = $prevTotalConfirmed > 0 ? round((($totalConfirmed - $prevTotalConfirmed) / $prevTotalConfirmed) * 100, 2) : 0;

                $prevTotalCancelled = $prevGlobalTotalCancelled;
                $totalCancelledGrowth = $prevTotalCancelled > 0 
                    ? round((($totalCancelled - $prevTotalCancelled) / $prevTotalCancelled) * 100, 2) 
                    : 0;
                
                // Total Daily Registrations & Growth
                $todayRegistrations = (int)$dailyStats->today_total_af + $todayCancelledNew; 
                $yesterdayRegistrations = (int)$dailyStats->yesterday_total_af + $yesterdayCancelledNew;
                $todayGrowth = $yesterdayRegistrations > 0 ? round((($todayRegistrations - $yesterdayRegistrations) / $yesterdayRegistrations) * 100, 2) : 0;
                
                $todayConfirmed = (int)$dailyStats->today_total_confirmed;
                $yesterdayConfirmed = (int)$dailyStats->yesterday_total_confirmed;
                $todayConfirmedGrowth = $yesterdayConfirmed > 0 ? round((($todayConfirmed - $yesterdayConfirmed) / $yesterdayConfirmed) * 100, 2) : 0;

                $todayCancelled = $todayTotalCancelled; 
                $yesterdayCancelled = $yesterdayTotalCancelled;
                $todayCancelledGrowth = $yesterdayCancelled > 0 ? round((($todayCancelled - $yesterdayCancelled) / $yesterdayCancelled) * 100, 2) : 0;

                // New Students Today
                // Today: Total Confirmed New Student
                $todayConfirmedNew = (int)$dailyStats->today_new_confirmed;
                $yesterdayConfirmedNew = (int)$dailyStats->yesterday_new_confirmed;
                $todayConfirmedNewGrowth = $yesterdayConfirmedNew > 0 ? round((($todayConfirmedNew - $yesterdayConfirmedNew) / $yesterdayConfirmedNew) * 100, 2) : 0;
                
                // Today: Total Cancelled New Student 
                $todayCancelledNewGrowth = $yesterdayCancelledNew > 0 ? round((($todayCancelledNew - $yesterdayCancelledNew) / $yesterdayCancelledNew) * 100, 2) : 0;
                
                // Today: Total New Students 
                $todayTotalNew = $todayConfirmedNew + $todayCancelledNew;
                $yesterdayTotalNew = (int)$dailyStats->yesterday_new_confirmed + $yesterdayCancelledNew;
                $todayTotalNewGrowth = $yesterdayTotalNew > 0 ? round((($todayTotalNew - $yesterdayTotalNew) / $yesterdayTotalNew) * 100, 2) : 0;
                
                // Returning Students Today
                // Today: Total Confirmed Returning Student
                $todayConfirmedReturning = (int)$dailyStats->today_returning_confirmed;
                $yesterdayConfirmedReturning = (int)$dailyStats->yesterday_returning_confirmed;
                $todayConfirmedReturningGrowth = $yesterdayConfirmedReturning > 0 ? round((($todayConfirmedReturning - $yesterdayConfirmedReturning) / $yesterdayConfirmedReturning) * 100, 2) : 0;
                
                // Today: Total Cancelled Returning Student
                $todayCancelledReturningGrowth = $yesterdayCancelledReturning > 0 ? round((($todayCancelledReturning - $yesterdayCancelledReturning) / $yesterdayCancelledReturning) * 100, 2) : 0;
                
                // Today: Total Returning Student 
                $todayTotalReturning = (int)$dailyStats->today_returning_confirmed + $todayCancelledReturning;
                $yesterdayTotalReturning = (int)$dailyStats->yesterday_returning_confirmed + $yesterdayCancelledReturning;
                $todayTotalReturningGrowth = $yesterdayTotalReturning > 0 ? round((($todayTotalReturning - $yesterdayTotalReturning) / $yesterdayTotalReturning) * 100, 2) : 0;
                                
                // Total Yearly Growth (New/Returning)
                $syTotal = (int)$yearlyStats->sy_total_af + $syCancelledNew;
                $syTotalPrevious = (int)$yearlyStats->sy_total_previous_af + $prevSyCancelledNew;
                $syTotalGrowth = $syTotalPrevious > 0 ? round((($syTotal - $syTotalPrevious) / $syTotalPrevious) * 100, 2) : 0;

                // Total Confirmed Current SY
                $syTotalConfirmed = (int)$yearlyStats->sy_total_confirmed;
                $syTotalConfirmedPrevious = (int)$yearlyStats->sy_total_confirmed_previous;
                $syTotalConfirmedGrowth = $syTotalConfirmedPrevious > 0 ? round((($syTotalConfirmed - $syTotalConfirmedPrevious) / $syTotalConfirmedPrevious) * 100, 2) : 0;

                // Total Cancelled Current SY
                $syCancelledGrowth = $prevSyTotalCancelled > 0 ? round((($syTotalCancelled - $prevSyTotalCancelled) / $prevSyTotalCancelled) * 100, 2) : 0;

                // New Students: Current School Year  
                // Current School Year: Total New Student
                $syTotalNew = (int)$yearlyStats->sy_new_confirmed + $syCancelledNew;
                $syTotalNewPrevious = (int)$yearlyStats->sy_new_confirmed_previous + $prevSyCancelledNew;
                $syTotalNewGrowth = $syTotalNewPrevious > 0 ? round((($syTotalNew - $syTotalNewPrevious) / $syTotalNewPrevious) * 100, 2) : 0;

                // Current School Year: Total Confirmed New 
                $syConfirmedNew = (int)$yearlyStats->sy_new_confirmed;
                $syConfirmedNewPrevious = (int)$yearlyStats->sy_new_confirmed_previous;
                $syConfirmedNewGrowth = $syConfirmedNewPrevious > 0 ? round((($syConfirmedNew - $syConfirmedNewPrevious) / $syConfirmedNewPrevious) * 100, 2) : 0;

                // Current School Year: Total Cancelled New
                $syCancelledNewGrowth = $prevSyCancelledNew > 0 ? round((($syCancelledNew - $prevSyCancelledNew) / $prevSyCancelledNew) * 100, 2) : 0;

                // Current School Year: Total Returning
                $syTotalReturning = (int)$yearlyStats->sy_returning_confirmed + $syCancelledReturning;
                $syTotalReturningPrevious = (int)$yearlyStats->sy_returning_confirmed_previous + $prevSyCancelledReturning;
                $syTotalReturningGrowth = $syTotalReturningPrevious > 0 ? round((($syTotalReturning - $syTotalReturningPrevious) / $syTotalReturningPrevious) * 100, 2) : 0;

                // Total Confirmed Returning Current SY
                $syConfirmedReturning = (int)$yearlyStats->sy_returning_confirmed;
                $syConfirmedReturningPrevious = (int)$yearlyStats->sy_returning_confirmed_previous;
                $syConfirmedReturningGrowth = $syConfirmedReturningPrevious > 0 ? round((($syConfirmedReturning - $syConfirmedReturningPrevious) / $syConfirmedReturningPrevious) * 100, 2) : 0;

                // Total Cancelled Returning Current SY
                $syCancelledReturningGrowth = $prevSyCancelledReturning > 0 ? round((($syCancelledReturning - $prevSyCancelledReturning) / $prevSyCancelledReturning) * 100, 2) : 0;

                return [
                    // Global
                    'total_registrations' => $totalRegistrations,
                    'total_registration_growth_percent' => $totalRegistrationGrowth,
                    'total_confirmed' => $totalConfirmed, 
                    'total_confirmed_growth_percent' => $totalConfirmedGrowth,
                    'total_cancelled' => $totalCancelled, 
                    'total_cancelled_growth_percent' => $totalCancelledGrowth,

                    // Daily All
                    'today_registration' => $todayRegistrations,
                    'today_registration_growth_percent' => $todayGrowth,
                    'today_confirmed' => $todayConfirmed, 
                    'today_confirmed_growth_percent' => $todayConfirmedGrowth,
                    'today_cancelled' => $todayCancelled, 
                    'today_cancelled_growth_percent' => $todayCancelledGrowth, 

                    // Daily New Students
                    'new_students_today_total' => $todayTotalNew, 
                    'new_students_today_total_growth_percent' => $todayTotalNewGrowth, 
                    'new_students_today_confirmed' => $todayConfirmedNew, 
                    'new_students_today_confirmed_growth_percent' => $todayConfirmedNewGrowth,
                    'new_students_today_cancelled' => $todayCancelledNew, 
                    'new_students_today_cancelled_growth_percent' => $todayCancelledNewGrowth, 

                    // Daily Returning Students
                    'returning_students_today_total' => $todayTotalReturning,
                    'returning_students_today_total_growth_percent' => $todayTotalReturningGrowth, 
                    'returning_students_today_confirmed' => $todayConfirmedReturning,
                    'returning_students_today_confirmed_growth_percent' => $todayConfirmedReturningGrowth,
                    'returning_students_today_cancelled' => $todayCancelledReturning, 
                    'returning_students_today_cancelled_growth_percent' => $todayCancelledReturningGrowth,

                    // Yearly All 
                    'sy_total_registration' => $syTotal, 
                    'sy_total_registration_growth_percent' => $syTotalGrowth, 
                    'sy_total_confirmed' => $syTotalConfirmed, 
                    'sy_total_confirmed_growth_percent' => $syTotalConfirmedGrowth,
                    'sy_total_cancelled' => $syTotalCancelled, 
                    'sy_total_cancelled_growth_percent' => $syCancelledGrowth, 

                    // Yearly New Students
                    'sy_new_students_total' => $syTotalNew, 
                    'sy_new_students_total_growth_percent' => $syTotalNewGrowth, 
                    'sy_new_students_confirmed' => $syConfirmedNew, 
                    'sy_new_students_confirmed_growth_percent' => $syConfirmedNewGrowth,
                    'sy_new_students_cancelled' => $syCancelledNew, 
                    'sy_new_students_cancelled_growth_percent' => $syCancelledNewGrowth, 

                    // Yearly Returning Students
                    'sy_returning_students_total' => $syTotalReturning, 
                    'sy_returning_students_total_growth_percent' => $syTotalReturningGrowth, 
                    'sy_returning_students_confirmed' => $syConfirmedReturning, 
                    'sy_returning_students_confirmed_growth_percent' => $syConfirmedReturningGrowth,
                    'sy_returning_students_cancelled' => $syCancelledReturning, 
                    'sy_returning_students_cancelled_growth_percent' => $syCancelledReturningGrowth, 

                    // Pre registers
                    'total_pre_registers_next_year' => $totalPreRegisters,

                    // Active students
                    'active_students_by_section' => $activeStudentsBySection,
                ];
            });
            $this->addCacheKey($statCacheKey);

            // Real-time Data
            $latestRegistrations = ApplicationForm::with([
                'enrollment.student', 
                'enrollment.schoolClass', 
                'enrollment.section', 
                'enrollment.schoolYear'
            ])
                ->orderByDesc('created_at')
                ->take(3)
                ->get()
                ->map(function ($form) {
                    $student = $form->enrollment->student;
                    $class = $form->enrollment->schoolClass;
                    $section = $form->enrollment->section;
                    $schoolYear = $form->enrollment->schoolYear;

                    return [
                        'application_id' => $form->application_id ?? null,
                        'student_id' => $student->student_id ?? null,
                        'full_name' => trim(
                            collect([$student->first_name, $student->middle_name, $student->last_name])
                                ->filter()
                                ->join(' ')
                        ),
                        'grade' => $class->grade ?? null,
                        'section' => $section->name ?? null,
                        'school_year' => $schoolYear->year ?? null,
                        'status' => $form->status ?? null,
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Dashboard data loaded successfully.',
                'data' => [
                    'username' => $username,
                    ...$meta,
                    ...$stats,
                    'latest_registrations' => $latestRegistrations,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('DashboardController Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard data',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}