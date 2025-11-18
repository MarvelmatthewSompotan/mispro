<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\AuditLog;
use App\Models\SchoolYear;
use App\Models\ApplicationForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
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
                    'current_school_year' => $schoolYears[$schoolYearStr] ?? null,
                    'previous_school_year' => $schoolYears[$previousYearStr] ?? null,
                ];
            });
            $this->addCacheKey($metaCacheKey);

            // CACHE 2: Statistik Data 
            $statCacheKey = 'dashboard_stats_' . $schoolYearStr . '_' . now()->format('Ymd');

            $stats = Cache::remember($statCacheKey, now()->addHours(24), function () use ($currentSchoolYearId, $previousSchoolYearId, $nextSchoolYearId, $startOfDay, $endOfDay, $yesterdayStart, $yesterdayEnd) {

                // Global Statistics
                $registrationStats = ApplicationForm::selectRaw('
                    COUNT(*) as total_registrations,
                    COUNT(CASE WHEN application_forms.status = "Confirmed" THEN 1 ELSE NULL END) as total_confirmed,
                    COUNT(CASE WHEN application_forms.status = "Cancelled" THEN 1 ELSE NULL END) as total_cancelled
                ')->first();

                $totalRegistrations = $registrationStats->total_registrations;

                // Daily Statistics
                $dailyStats = ApplicationForm::selectRaw('
                    -- Today Stats
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS today_total,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? AND enrollments.student_status = "New" THEN 1 ELSE 0 END) AS today_new,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? AND enrollments.student_status = "Old" THEN 1 ELSE 0 END) AS today_returning,

                    -- Yesterday Stats
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS yesterday_total,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? AND enrollments.student_status = "New" THEN 1 ELSE 0 END) AS yesterday_new,
                    SUM(CASE WHEN application_forms.status = "Confirmed" AND created_at BETWEEN ? AND ? AND enrollments.student_status = "Old" THEN 1 ELSE 0 END) AS yesterday_returning
                ', [
                    $startOfDay, $endOfDay, $startOfDay, $endOfDay, $startOfDay, $endOfDay,
                    $yesterdayStart, $yesterdayEnd, $yesterdayStart, $yesterdayEnd, $yesterdayStart, $yesterdayEnd
                ])
                ->join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                ->first();
                
                // Yearly Statistics
                $yearlyStats = ApplicationForm::where('application_forms.status', 'Confirmed')
                    ->join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                    ->selectRaw('
                        SUM(CASE WHEN enrollments.school_year_id = ? THEN 1 ELSE 0 END) AS total_current,
                        SUM(CASE WHEN enrollments.school_year_id = ? THEN 1 ELSE 0 END) AS total_previous,
                        
                        SUM(CASE WHEN enrollments.school_year_id = ? AND enrollments.student_status = "New" THEN 1 ELSE 0 END) AS new_current,
                        SUM(CASE WHEN enrollments.school_year_id = ? AND enrollments.student_status = "Old" THEN 1 ELSE 0 END) AS returning_current,
                        
                        SUM(CASE WHEN enrollments.school_year_id = ? AND enrollments.student_status = "New" THEN 1 ELSE 0 END) AS new_previous,
                        SUM(CASE WHEN enrollments.school_year_id = ? AND enrollments.student_status = "Old" THEN 1 ELSE 0 END) AS returning_previous
                    ', [
                        $currentSchoolYearId, $previousSchoolYearId, 
                        $currentSchoolYearId, $currentSchoolYearId, 
                        $previousSchoolYearId, $previousSchoolYearId
                    ])
                    ->whereIn('enrollments.school_year_id', array_filter([$currentSchoolYearId, $previousSchoolYearId]))
                    ->first();
                
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

                // Total Yearly Registrations & Growth
                $totalCurrentYear = $yearlyStats->total_current;
                $totalPreviousYear = $yearlyStats->total_previous;
                $registrationGrowth = $totalPreviousYear > 0 ? round((($totalCurrentYear - $totalPreviousYear) / $totalPreviousYear) * 100, 2) : 0;
                
                // Total Daily Registrations & Growth
                $todayRegistrations = $dailyStats->today_total;
                $yesterdayRegistrations = $dailyStats->yesterday_total;
                $todayGrowth = $yesterdayRegistrations > 0 ? round((($todayRegistrations - $yesterdayRegistrations) / $yesterdayRegistrations) * 100, 2) : 0;
                
                // Daily Growth (New/Returning)
                $newStudentsToday = $dailyStats->today_new;
                $returningStudentsToday = $dailyStats->today_returning;
                $newStudentsYesterday = $dailyStats->yesterday_new;
                $returningStudentsYesterday = $dailyStats->yesterday_returning;
                $newStudentGrowth = $newStudentsYesterday > 0 ? round((($newStudentsToday - $newStudentsYesterday) / $newStudentsYesterday) * 100, 2) : 0;
                $returningStudentGrowth = $returningStudentsYesterday > 0 ? round((($returningStudentsToday - $returningStudentsYesterday) / $returningStudentsYesterday) * 100, 2) : 0;
                
                // Yearly Growth (New/Returning)
                $newStudentsCurrentYear = $yearlyStats->new_current;
                $returningStudentsCurrentYear = $yearlyStats->returning_current;
                $newStudentsPrevYear = $yearlyStats->new_previous;
                $returningStudentsPrevYear = $yearlyStats->returning_previous;
                $newStudentYearlyGrowth = $newStudentsPrevYear > 0 ? round((($newStudentsCurrentYear - $newStudentsPrevYear) / $newStudentsPrevYear) * 100, 2) : 0;
                $returningStudentYearlyGrowth = $returningStudentsPrevYear > 0 ? round((($returningStudentsCurrentYear - $returningStudentsPrevYear) / $returningStudentsPrevYear) * 100, 2) : 0;


                return [
                    'total_registrations' => $totalRegistrations,
                    'total_registration_growth_percent' => $registrationGrowth,
                    'today_registration' => $todayRegistrations,
                    'today_registration_growth_percent' => $todayGrowth,
                    'new_students_today' => $newStudentsToday,
                    'new_students_today_growth_percent' => $newStudentGrowth,
                    'returning_students_today' => $returningStudentsToday,
                    'returning_students_today_growth_percent' => $returningStudentGrowth,
                    'new_students_current_year' => $newStudentsCurrentYear,
                    'returning_students_current_year' => $returningStudentsCurrentYear,
                    'new_students_yearly_growth_percent' => $newStudentYearlyGrowth,
                    'returning_students_yearly_growth_percent' => $returningStudentYearlyGrowth,
                    'total_pre_registers_next_year' => $totalPreRegisters,
                    'active_students_by_section' => $activeStudentsBySection,
                ];
            });
            $this->addCacheKey($statCacheKey);

            // Real-time Data (Aman dari N+1)
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