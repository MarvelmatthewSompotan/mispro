<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\AuditLog;
use App\Models\SchoolYear;
use Illuminate\Http\Request;
use App\Models\ApplicationForm;
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

            $currentMonth = now()->month;
            $currentYear = now()->year;

            $schoolYearStr = ($currentMonth >= 7)
                ? $currentYear . '/' . ($currentYear + 1)
                : ($currentYear - 1) . '/' . $currentYear;

            $previousYearStr = ($currentMonth >= 7)
                ? ($currentYear - 1) . '/' . $currentYear
                : ($currentYear - 2) . '/' . ($currentYear - 1);

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

            $meta = Cache::remember($metaCacheKey, now()->addHours(24), function () use ($user, $schoolYearStr, $previousYearStr) {
                $lastLogin = AuditLog::where('action', 'login_success')
                    ->where('user_id', $user->user_id)
                    ->orderByDesc('created_at')
                    ->first();

                return [
                    'last_login' => $lastLogin ? $lastLogin->created_at->toDateTimeString() : null,
                    'current_school_year' => SchoolYear::where('year', $schoolYearStr)->first()?->year,
                    'previous_school_year' => SchoolYear::where('year', $previousYearStr)->first()?->year,
                ];
            });
            $this->addCacheKey($metaCacheKey);

            // CACHE 2: Statistik Data 
            $statCacheKey = 'dashboard_stats_' . $schoolYearStr . '_' . now()->format('Ymd');

            $stats = Cache::remember($statCacheKey, now()->addHours(24), function () use ($schoolYearStr, $previousYearStr, $startOfDay, $endOfDay, $date) {
                $currentSchoolYear = SchoolYear::where('year', $schoolYearStr)->first();
                $previousSchoolYear = SchoolYear::where('year', $previousYearStr)->first();
                $currentSchoolYearId = $currentSchoolYear?->school_year_id;
                $previousSchoolYearId = $previousSchoolYear?->school_year_id;

                $totalRegistrations = ApplicationForm::count();
                $totalRegistrationsConfirmed = ApplicationForm::where('status', 'Confirmed')->count();
                $totalRegistrationsCancelled = ApplicationForm::where('status', 'Cancelled')->count();

                $totalCurrentYear = $currentSchoolYearId
                    ? ApplicationForm::where('status', 'Confirmed')
                        ->whereHas('enrollment', fn($q) => 
                            $q->where('school_year_id', $currentSchoolYearId)
                            )->count()
                        : 0;

                $totalPreviousYear = $previousSchoolYearId
                    ? ApplicationForm::where('status', 'Confirmed')
                        ->whereHas('enrollment', fn($q) => 
                        $q->where('school_year_id', $previousSchoolYearId)
                        )->count()
                    : 0;

                $registrationGrowth = $totalPreviousYear > 0
                    ? round((($totalCurrentYear - $totalPreviousYear) / $totalPreviousYear) * 100, 2)
                    : 0;

                $todayRegistrations = ApplicationForm::where('status', 'Confirmed')
                    ->whereBetween('created_at', [$startOfDay, $endOfDay])
                    ->count();

                $yesterdayStart = Carbon::parse($date)->subDay()->startOfDay();
                $yesterdayEnd = Carbon::parse($date)->subDay()->endOfDay();
                $yesterdayRegistrations = ApplicationForm::where('status', 'Confirmed')
                    ->whereBetween('created_at', [$yesterdayStart, $yesterdayEnd])
                    ->count();

                $todayGrowth = $yesterdayRegistrations > 0
                    ? round((($todayRegistrations - $yesterdayRegistrations) / $yesterdayRegistrations) * 100, 2)
                    : 0;

                $newStudentsToday = ApplicationForm::where('status', 'Confirmed')
                    ->whereBetween('created_at', [$startOfDay, $endOfDay])
                    ->whereHas('enrollment', fn($q) => $q->where('student_status', 'New'))
                    ->count();

                $returningStudentsToday = ApplicationForm::where('status', 'Confirmed')
                    ->whereBetween('created_at', [$startOfDay, $endOfDay])
                    ->whereHas('enrollment', fn($q) => $q->where('student_status', 'Old'))
                    ->count();

                $newStudentsYesterday = ApplicationForm::where('status', 'Confirmed')
                    ->whereBetween('created_at', [$yesterdayStart, $yesterdayEnd])
                    ->whereHas('enrollment', fn($q) => $q->where('student_status', 'New'))
                    ->count();

                $returningStudentsYesterday = ApplicationForm::where('status', 'Confirmed')
                    ->whereBetween('created_at', [$yesterdayStart, $yesterdayEnd])
                    ->whereHas('enrollment', fn($q) => $q->where('student_status', 'Old'))
                    ->count();

                $newStudentGrowth = $newStudentsYesterday > 0
                    ? round((($newStudentsToday - $newStudentsYesterday) / $newStudentsYesterday) * 100, 2)
                    : 0;

                $returningStudentGrowth = $returningStudentsYesterday > 0
                    ? round((($returningStudentsToday - $returningStudentsYesterday) / $returningStudentsYesterday) * 100, 2)
                    : 0;

                $newStudentsCurrentYear = $currentSchoolYearId
                    ? ApplicationForm::where('status', 'Confirmed')
                        ->whereHas('enrollment', fn($q) =>
                            $q->where('school_year_id', $currentSchoolYearId)
                                ->where('student_status', 'New')
                        )->count()
                        : 0;

                $returningStudentsCurrentYear = $currentSchoolYearId
                    ? ApplicationForm::where('status', 'Confirmed')
                        ->whereHas('enrollment', fn($q) =>
                            $q->where('school_year_id', $currentSchoolYearId)
                                ->where('student_status', 'Old')
                        )->count()
                        : 0;

                $newStudentsPrevYear = $previousSchoolYearId
                    ? ApplicationForm::where('status', 'Confirmed')
                        ->whereHas('enrollment', fn($q) =>
                            $q->where('school_year_id', $previousSchoolYearId)
                                ->where('student_status', 'New')
                        )->count()
                        : 0;

                $returningStudentsPrevYear = $previousSchoolYearId
                    ? ApplicationForm::where('status', 'Confirmed')
                        ->whereHas('enrollment', fn($q) =>
                            $q->where('school_year_id', $previousSchoolYearId)
                                ->where('student_status', 'Old')
                        )->count()
                        : 0;

                $newStudentYearlyGrowth = $newStudentsPrevYear > 0
                    ? round((($newStudentsCurrentYear - $newStudentsPrevYear) / $newStudentsPrevYear) * 100, 2)
                    : 0;

                $returningStudentYearlyGrowth = $returningStudentsPrevYear > 0
                    ? round((($returningStudentsCurrentYear - $returningStudentsPrevYear) / $returningStudentsPrevYear) * 100, 2)
                    : 0;

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
                ];
            });
            $this->addCacheKey($statCacheKey);

            // Real-time Data
            $latestRegistrations = ApplicationForm::with(['enrollment.student', 'enrollment.schoolClass', 'enrollment.section', 'enrollment.schoolYear'])
                ->where('status', 'Confirmed')
                ->orderByDesc('created_at')
                ->take(3)
                ->get()
                ->map(function ($form) {
                    $student = $form->enrollment->student;
                    $class = $form->enrollment->schoolClass;
                    $section = $form->enrollment->section;
                    $schoolYear = $form->enrollment->schoolYear;

                    return [
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
