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
    public function index(Request $request)
    {
        try {
            $username = $request->user()->username;
            $user = Auth::user();

            $cacheKey = 'dashboard_data_' . $user->user_id . '_' . now()->toDateString();

            if (Cache::has($cacheKey)) {
                $dashboardData = Cache::get($cacheKey);
                $fromCache = true;
            } else {
                $dashboardData = Cache::remember($cacheKey, 300, function () use ($request, $user, $username) {
                    $lastLogin = AuditLog::where('action', 'login_success')
                        ->where('user_id', $user->user_id)
                        ->orderByDesc('created_at')
                        ->first();

                    // Date
                    $date = $request->query('date')
                        ? Carbon::parse($request->query('date'))->toDateString()
                        : Carbon::today()->toDateString();

                    $startOfDay = Carbon::parse($date)->startOfDay();
                    $endOfDay = Carbon::parse($date)->endOfDay();

                    // School year
                    $currentMonth = now()->month;
                    $currentYear = now()->year;

                    $schoolYearStr = ($currentMonth >= 7)
                        ? $currentYear . '/' . ($currentYear + 1)
                        : ($currentYear - 1) . '/' . $currentYear;
                    $currentSchoolYear = SchoolYear::where('year', $schoolYearStr)->first();

                    $previousYearStr = ($currentMonth >= 7)
                        ? ($currentYear - 1) . '/' . $currentYear
                        : ($currentYear - 2) . '/' . ($currentYear - 1);
                    $previousSchoolYear = SchoolYear::where('year', $previousYearStr)->first();

                    $currentSchoolYearId = $currentSchoolYear?->school_year_id;
                    $previousSchoolYearId = $previousSchoolYear?->school_year_id;

                    // Total Registration
                    $totalRegistrations = ApplicationForm::count();

                    $totalCurrentYear = $currentSchoolYearId
                        ? ApplicationForm::whereHas('enrollment', fn($q) => $q->where('school_year_id', $currentSchoolYearId))->count()
                        : 0;

                    $totalPreviousYear = $previousSchoolYearId
                        ? ApplicationForm::whereHas('enrollment', fn($q) => $q->where('school_year_id', $previousSchoolYearId))->count()
                        : 0;

                    $registrationGrowth = $totalPreviousYear > 0
                        ? round((($totalCurrentYear - $totalPreviousYear) / $totalPreviousYear) * 100, 2)
                        : 0;

                    // Today's Registrations
                    $todayRegistrations = ApplicationForm::whereBetween('created_at', [$startOfDay, $endOfDay])->count();

                    // Yesterday's Registrations
                    $yesterdayStart = Carbon::parse($date)->subDay()->startOfDay();
                    $yesterdayEnd = Carbon::parse($date)->subDay()->endOfDay();
                    $yesterdayRegistrations = ApplicationForm::whereBetween('created_at', [$yesterdayStart, $yesterdayEnd])->count();

                    $todayGrowth = $yesterdayRegistrations > 0
                        ? round((($todayRegistrations - $yesterdayRegistrations) / $yesterdayRegistrations) * 100, 2)
                        : 0;

                    // New / Returning
                    $newStudentsToday = ApplicationForm::whereBetween('created_at', [$startOfDay, $endOfDay])
                        ->whereHas('enrollment', fn($q) => $q->where('student_status', 'New'))
                        ->count();

                    $returningStudentsToday = ApplicationForm::whereBetween('created_at', [$startOfDay, $endOfDay])
                        ->whereHas('enrollment', fn($q) => $q->where('student_status', 'Old'))
                        ->count();

                    $newStudentsYesterday = ApplicationForm::whereBetween('created_at', [$yesterdayStart, $yesterdayEnd])
                        ->whereHas('enrollment', fn($q) => $q->where('student_status', 'New'))
                        ->count();

                    $returningStudentsYesterday = ApplicationForm::whereBetween('created_at', [$yesterdayStart, $yesterdayEnd])
                        ->whereHas('enrollment', fn($q) => $q->where('student_status', 'Old'))
                        ->count();

                    $newStudentGrowth = $newStudentsYesterday > 0
                        ? round((($newStudentsToday - $newStudentsYesterday) / $newStudentsYesterday) * 100, 2)
                        : 0;

                    $returningStudentGrowth = $returningStudentsYesterday > 0
                        ? round((($returningStudentsToday - $returningStudentsYesterday) / $returningStudentsYesterday) * 100, 2)
                        : 0;

                    $newStudentsCurrentYear = $currentSchoolYearId
                        ? ApplicationForm::whereHas('enrollment', fn($q) =>
                            $q->where('school_year_id', $currentSchoolYearId)
                                ->where('student_status', 'New')
                        )->count()
                        : 0;

                    $newStudentsPrevYear = $previousSchoolYearId
                        ? ApplicationForm::whereHas('enrollment', fn($q) =>
                            $q->where('school_year_id', $previousSchoolYearId)
                                ->where('student_status', 'New')
                        )->count()
                        : 0;

                    $returningStudentsCurrentYear = $currentSchoolYearId
                        ? ApplicationForm::whereHas('enrollment', fn($q) =>
                            $q->where('school_year_id', $currentSchoolYearId)
                                ->where('student_status', 'Old')
                        )->count()
                        : 0;

                    $returningStudentsPrevYear = $previousSchoolYearId
                        ? ApplicationForm::whereHas('enrollment', fn($q) =>
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

                    $latestRegistrations = ApplicationForm::with(['enrollment.student', 'enrollment.schoolClass', 'enrollment.section', 'enrollment.schoolYear'])
                        ->whereBetween('created_at', [$startOfDay, $endOfDay])
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

                    return [
                        'username' => $username,
                        'last_login' => $lastLogin ? $lastLogin->created_at->toDateTimeString() : null,
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
                        'latest_registrations' => $latestRegistrations,
                        'current_school_year' => $currentSchoolYear?->year ?? null,
                        'previous_school_year' => $previousSchoolYear?->year ?? null,
                    ];
                });
                $fromCache = false;
            }

            return response()->json([
                'success' => true,
                'message' => $fromCache
                    ? 'Dashboard data retrieved from cache.'
                    : 'Dashboard data generated and cached.',
                'data' => $dashboardData,
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
