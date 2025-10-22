<?php

namespace App\Http\Controllers;

use App\Models\ApplicationForm;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index (Request $request) {
        try{
            $date = $request->query('date')
                ? Carbon::parse($request->query('date'))->toDateString()
                : Carbon::today()->toDateString();
            
            $startOfDay = Carbon::parse($date)->startOfDay();
            $endOfDay = Carbon::parse($date)->endOfDay();

            $totalRegistrations = ApplicationForm::count();

            $todayRegistrations = ApplicationForm::whereBetween('created_at', [$startOfDay, $endOfDay])->count();

            $newStudentsToday = ApplicationForm::whereBetween('created_at', [$startOfDay, $endOfDay])
                ->whereHas('enrollment', fn($q) => $q->where('student_status', 'New'))
                ->count();

            $returningStudentsToday = ApplicationForm::whereBetween('created_at', [$startOfDay, $endOfDay])
                ->whereHas('enrollment', fn($q) => $q->where('student_status', 'Old'))
                ->count();
            
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

            return response()->json([
                'success' => true,
                'message' => 'Dashboard data retrieved successfully.',
                'data' => [
                    'total_registrations' => $totalRegistrations,
                    'today_registration' => $todayRegistrations,
                    'new_students_today' => $newStudentsToday,
                    'returning_students_today' => $returningStudentsToday,
                    'latest_registrations' => $latestRegistrations,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('DashboardController Error: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard data',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
