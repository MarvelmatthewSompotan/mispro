<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\SchoolYear;
use Illuminate\Http\Request;
use App\Models\ApplicationForm;
use Illuminate\Support\Facades\DB;
use App\Models\CancelledRegistration;
use Illuminate\Support\Facades\Cache;

class AnalyticsController extends Controller
{
    private function calculateGrowth($current, $previous)
    {
        if ($previous > 0) {
            return round((($current - $previous) / $previous) * 100, 2);
        }

        return $previous === 0 && $current > 0 ? 100 : 0;
    }

    public function index (Request $request) 
    {
        try {
            // Filter Date
            $filterDate = $request->query('date') ? Carbon::parse($request->query('date')) : Carbon::now();
            $dateKey = $filterDate->format('Y-m-d');

            $currentYearInt = $filterDate->year;
            $startYear = $filterDate->month >= 7 ? $currentYearInt : $currentYearInt - 1;

            $currentSyName = $startYear . '/' . ($startYear + 1);
            $prevSyName = ($startYear - 1) . '/' . $startYear;
            $nextSyName = ($startYear + 1) . '/' . ($startYear + 2);

            // Cache Key
            $cacheKey = 'analytics_full_' . $dateKey;

            $cacheTime = now()->addHours(24);
            $data = Cache::remember($cacheKey, $cacheTime, function () use ($filterDate, $currentSyName, $prevSyName, $nextSyName, $startYear) {
                $startOfDay = $filterDate->copy()->startOfDay();
                $endOfDay = $filterDate->copy()->endOfDay();
                $yesterdayStart = $filterDate->copy()->subDay()->startOfDay();
                $yesterdayEnd = $filterDate->copy()->subDay()->endOfDay();

                // Get IDs for School Years
                $syMap = SchoolYear::whereIn('year', [$currentSyName, $prevSyName, $nextSyName])->pluck('school_year_id', 'year');
                $currSyId = $syMap[$currentSyName] ?? null;
                $prevSyId = $syMap[$prevSyName] ?? null;
                $nextSyId = $syMap[$nextSyName] ?? null;

                // 1. TOTAL REGISTRATION (Global)
                $registrationStats = ApplicationForm::selectRaw('
                    COUNT(*) as total_registrations,
                    COUNT(CASE WHEN application_forms.status = "Confirmed" THEN 1 ELSE NULL END) as total_confirmed
                ')->first();
                $prevReg = ApplicationForm::where('created_at', '<', $startOfDay)->count();

                $totalConfirmed = (int)($registrationStats->total_confirmed ?? 0);
                $prevTotalConfirmed = ApplicationForm::where('status', 'Confirmed')->where('created_at', '<', $startOfDay)->count();

                $globalCancelledNew = CancelledRegistration::where('student_status', 'New')
                    ->where('reason', 'Cancellation of Enrollment')
                    ->count();
                $globalCancelledTrans = CancelledRegistration::where('student_status', 'Transferee')
                    ->where('reason', 'Cancellation of Enrollment')
                    ->count();
                $globalCancelledReturning = ApplicationForm::where('status', 'Cancelled')
                    ->count();
                $totalCancelled = $globalCancelledReturning + $globalCancelledNew + $globalCancelledTrans;
                
                $prevGlobalCancelledNew = CancelledRegistration::where('student_status', 'New')
                    ->where('reason', 'Cancellation of Enrollment')
                    ->where('cancelled_at', '<', $startOfDay)
                    ->count();
                $prevGlobalCancelledTrans = CancelledRegistration::where('student_status', 'Transferee')
                    ->where('reason', 'Cancellation of Enrollment')
                    ->where('cancelled_at', '<', $startOfDay)
                    ->count();
                $prevGlobalCancelledReturning = ApplicationForm::where('status', 'Cancelled')
                    ->where('updated_at', '<', $startOfDay)
                    ->count();
                $prevGlobalTotalCancelled = $prevGlobalCancelledReturning + $prevGlobalCancelledNew + $prevGlobalCancelledTrans;
                
                $totalRegistrations = (int)($registrationStats->total_registrations ?? 0) + $globalCancelledNew + $globalCancelledTrans;
                $prevTotalRegistrations = (int)$prevReg + $prevGlobalCancelledNew + $prevGlobalCancelledTrans;

                // 2. TODAY REGISTRATION
                $dailyQuery = function($start, $end) {
                    return DB::table('application_forms')
                        ->join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                        ->selectRaw('
                            COUNT(*) as total,
                            SUM(CASE WHEN application_forms.status = "Confirmed" THEN 1 ELSE 0 END) as confirmed,
                            SUM(CASE WHEN application_forms.status = "Cancelled" THEN 1 ELSE 0 END) as cancelled_af,
                            
                            -- New Students
                            SUM(CASE WHEN enrollments.student_status = "New" AND application_forms.status = "Confirmed" THEN 1 ELSE 0 END) as new_confirmed,
                            SUM(CASE WHEN enrollments.student_status = "New" AND application_forms.status = "Cancelled" THEN 1 ELSE 0 END) as new_cancelled_af,
                            
                            -- Transferee
                            SUM(CASE WHEN enrollments.student_status = "Transferee" AND application_forms.status = "Confirmed" THEN 1 ELSE 0 END) as trans_confirmed,
                            SUM(CASE WHEN enrollments.student_status = "Transferee" AND application_forms.status = "Cancelled" THEN 1 ELSE 0 END) as trans_cancelled_af,

                            -- Returning
                            SUM(CASE WHEN enrollments.student_status = "Old" THEN 1 ELSE 0 END) as old_total,
                            SUM(CASE WHEN enrollments.student_status = "Old" AND application_forms.status = "Confirmed" THEN 1 ELSE 0 END) as old_confirmed,
                            SUM(CASE WHEN enrollments.student_status = "Old" AND application_forms.status = "Cancelled" THEN 1 ELSE 0 END) as old_cancelled_af
                        ')
                        ->whereBetween('application_forms.created_at', [$start, $end])
                        ->first();
                };

                $todayStats = $dailyQuery($startOfDay, $endOfDay);
                $yesterdayStats = $dailyQuery($yesterdayStart, $yesterdayEnd);

                // Cancelled Registration Table 
                $todayNewCancelledReg = CancelledRegistration::where('student_status', 'New')
                    ->where('reason', 'Cancellation of Enrollment')
                    ->whereBetween('cancelled_at', [$startOfDay, $endOfDay])
                    ->count();
                $yesterdayNewCancelledReg = CancelledRegistration::where('student_status', 'New')
                    ->where('reason', 'Cancellation of Enrollment')
                    ->whereBetween('cancelled_at', [$yesterdayStart, $yesterdayEnd])
                    ->count();
                $todayTransCancelledReg = CancelledRegistration::where('student_status', 'Transferee')
                    ->where('reason', 'Cancellation of Enrollment')
                    ->whereBetween('cancelled_at', [$startOfDay, $endOfDay])
                    ->count();
                $yesterdayTransCancelledReg = CancelledRegistration::where('student_status', 'Transferee')
                    ->where('reason', 'Cancellation of Enrollment')
                    ->whereBetween('cancelled_at', [$yesterdayStart, $yesterdayEnd])
                    ->count();

                // Helper safe access
                $v = fn($obj, $prop) => (int)($obj->$prop ?? 0);

                $new_cancelled_today = $v($todayStats, 'new_cancelled_af') + $todayNewCancelledReg;
                $trans_cancelled_today = $v($todayStats, 'trans_cancelled_af') + $todayTransCancelledReg;

                $new_cancelled_yesterday = $v($yesterdayStats, 'new_cancelled_af') + $yesterdayNewCancelledReg;
                $trans_cancelled_yesterday = $v($yesterdayStats, 'trans_cancelled_af') + $yesterdayTransCancelledReg;

                // Data Today (Cleaned)
                $todayData = [
                    'total' => $v($todayStats, 'total') + $todayNewCancelledReg + $todayTransCancelledReg,
                    'confirmed' => $v($todayStats, 'confirmed'),
                    'cancelled' => $v($todayStats, 'cancelled_af') + $todayNewCancelledReg + $todayTransCancelledReg,
                    
                    'new_confirmed' => $v($todayStats, 'new_confirmed'),
                    'new_cancelled' => $new_cancelled_today,
                    'new_total' => $v($todayStats, 'new_confirmed') + $new_cancelled_today,

                    'trans_confirmed' => $v($todayStats, 'trans_confirmed'),
                    'trans_cancelled' => $trans_cancelled_today,
                    'trans_total' => $v($todayStats, 'trans_confirmed') + $trans_cancelled_today,

                    'old_total' => $v($todayStats, 'old_total'),
                    'old_confirmed' => $v($todayStats, 'old_confirmed'),
                    'old_cancelled' => $v($todayStats, 'old_cancelled_af'),
                ];
                
                // Data Yesterday
                $yesterdayData = [
                    'total' => $v($yesterdayStats, 'total') + $yesterdayNewCancelledReg + $yesterdayTransCancelledReg,
                    'confirmed' => $v($yesterdayStats, 'confirmed'),
                    'cancelled' => $v($yesterdayStats, 'cancelled_af') + $yesterdayNewCancelledReg + $yesterdayTransCancelledReg,

                    'new_confirmed' => $v($yesterdayStats, 'new_confirmed'),
                    'new_cancelled' => $new_cancelled_yesterday,
                    'new_total' =>  $v($yesterdayStats, 'new_confirmed') + $new_cancelled_yesterday,
                    
                    'trans_confirmed' => $v($yesterdayStats, 'trans_confirmed'),
                    'trans_cancelled' => $trans_cancelled_yesterday,
                    'trans_total' => $v($yesterdayStats, 'trans_confirmed') + $trans_cancelled_yesterday,

                    'old_total' => $v($yesterdayStats, 'old_total'),
                    'old_confirmed' => $v($yesterdayStats, 'old_confirmed'),
                    'old_cancelled' => $v($yesterdayStats, 'old_cancelled_af'),
                ];

                // 3. CURRENT SCHOOL YEAR
                $syQuery = function($syId) {
                    if (!$syId) return null;
                    return DB::table('application_forms')
                        ->join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                        ->selectRaw('
                            -- Unique Students
                            COUNT(DISTINCT enrollments.id) as total_unique_students,
                            
                            -- Unique Students (CONFIRMED)
                            COUNT(DISTINCT CASE WHEN application_forms.status = "Confirmed" THEN enrollments.id END) as total_unique_confirmed,

                            -- New Students (First Priority)
                            COUNT(DISTINCT CASE WHEN enrollments.student_status = "New" THEN enrollments.id END) as new_total,
                            COUNT(DISTINCT CASE WHEN enrollments.student_status = "New" AND application_forms.status = "Confirmed" THEN enrollments.id END) as new_confirmed,
                            
                            -- Transferee Students (Second Priority)
                            COUNT(DISTINCT CASE WHEN enrollments.student_status = "Transferee" THEN enrollments.id END) as trans_total,
                            COUNT(DISTINCT CASE WHEN enrollments.student_status = "Transferee" AND application_forms.status = "Confirmed" THEN enrollments.id END) as trans_confirmed
                        ')
                        ->where('enrollments.school_year_id', $syId)
                        ->first();
                };

                $currSyStats = $syQuery($currSyId);
                $prevSyStats = $syQuery($prevSyId);

                // Cancelled Reg Helper
                $countCancSy = function($status, $syId) {
                    return $syId ? CancelledRegistration::where('student_status', $status)
                        ->where('reason', 'Cancellation of Enrollment')
                        ->where('school_year_id', $syId)
                        ->count() : 0;
                };

                $currSyNewCancelledReg = $countCancSy('New', $currSyId);
                $prevSyNewCancelledReg = $countCancSy('New', $prevSyId);
                $currSyTransCancelledReg = $countCancSy('Transferee', $currSyId);
                $prevSyTransCancelledReg = $countCancSy('Transferee', $prevSyId);

                // == CURRENT ==
                $currSyTotal = $v($currSyStats, 'total_unique_students') + $currSyNewCancelledReg + $currSyTransCancelledReg;
                $currSyConfirmed = $v($currSyStats, 'total_unique_confirmed');
                $currSyCancelledTotal = $currSyTotal - $currSyConfirmed;
                
                // A. New Students
                $currSyNewTotal = $v($currSyStats, 'new_total') + $currSyNewCancelledReg;
                $currSyNewConfirmed = $v($currSyStats, 'new_confirmed');
                $currSyNewCancelled = $currSyNewTotal - $currSyNewConfirmed;
                
                // B. Transferee Students
                $currSyTransTotal = $v($currSyStats, 'trans_total') + $currSyTransCancelledReg;
                $currSyTransConfirmed = $v($currSyStats, 'trans_confirmed');
                $currSyTransCancelled = $currSyTransTotal - $currSyTransConfirmed;
                
                // C. Returning / Old Students
                $currSyOldTotal = max(0, $currSyTotal - ($currSyNewTotal + $currSyTransTotal));
                $currSyOldConfirmed = max(0, $currSyConfirmed - ($currSyNewConfirmed + $currSyTransConfirmed));
                $currSyOldCancelled = max(0, $currSyOldTotal - $currSyOldConfirmed);
                
                // == PREVIOUS ==
                $prevSyTotal = $v($prevSyStats, 'total_unique_students') + $prevSyNewCancelledReg + $prevSyTransCancelledReg;
                $prevSyConfirmed = $v($prevSyStats, 'total_unique_confirmed');
                $prevSyCancelledTotal = $prevSyTotal - $prevSyConfirmed;
                
                // A. Prev New Students
                $prevSyNewTotal = $v($prevSyStats, 'new_total') + $prevSyNewCancelledReg;
                $prevSyNewConfirmed = $v($prevSyStats, 'new_confirmed');
                $prevSyNewCancelled = $prevSyNewTotal - $prevSyNewConfirmed;
                
                // B. Prev Transferee Students
                $prevSyTransTotal = $v($prevSyStats, 'trans_total') + $prevSyTransCancelledReg;
                $prevSyTransConfirmed = $v($prevSyStats, 'trans_confirmed');
                $prevSyTransCancelled = $prevSyTransTotal - $prevSyTransConfirmed;
                
                // C. Prev Returning / Old Students
                $prevSyOldTotal = max(0, $prevSyTotal - ($prevSyNewTotal + $prevSyTransTotal));
                $prevSyOldConfirmed = max(0, $prevSyConfirmed - ($prevSyNewConfirmed + $prevSyTransConfirmed));
                $prevSyOldCancelled = max(0, $prevSyOldTotal - $prevSyOldConfirmed);
                
                // 4. ACTIVE STUDENT PER SECTION
                $sections = [
                    'ECP' => ['ecp'], 
                    'Elementary School' => ['elementary'], 
                    'Middle School' => ['middle'], 
                    'High School' => ['high']
                ];

                $activeStudents = [];

                $allActiveStudents = DB::table('students')
                    ->join('enrollments', 'students.id', '=', 'enrollments.id')
                    ->join('application_forms', 'enrollments.enrollment_id', '=', 'application_forms.enrollment_id')
                    ->join('sections', 'enrollments.section_id', '=', 'sections.section_id')
                    ->where('students.active', 'YES')
                    ->where('application_forms.status', 'Confirmed')
                    ->where('enrollments.school_year_id', $currSyId)
                    ->select(
                        'students.id as student_id',
                        'enrollments.student_status',
                        'sections.name as section_name'
                    )
                    ->distinct() 
                    ->get();

                $globalNewStudentIds = $allActiveStudents
                    ->where('student_status', 'New')
                    ->pluck('student_id')
                    ->unique();

                foreach ($sections as $label => $keywords) {
                    $sectionData = $allActiveStudents->filter(function($item) use ($keywords) {
                        foreach ($keywords as $key) {
                            if (stripos($item->section_name, $key) !== false) {
                                return true;
                            }
                        }
                        return false;
                    });

                    // 1. Total Unique
                    $totalUnique = $sectionData->unique('student_id')->count();

                    // 2. Total New 
                    $countNew = $sectionData
                        ->where('student_status', 'New')
                        ->unique('student_id')
                        ->count();

                    // 3. Total Transferee 
                    $countTransferee = $sectionData
                        ->where('student_status', 'Transferee')
                        ->whereNotIn('student_id', $globalNewStudentIds) 
                        ->unique('student_id')
                        ->count();

                    // 4. Total Returning
                    $totalReturning = max(0, $totalUnique - ($countNew + $countTransferee));

                    $activeStudents[$label] = [
                        'total' => $totalUnique,
                        'total_new' => $countNew,
                        'total_transferee' => $countTransferee,
                        'total_returning' => $totalReturning 
                    ];
                }

                // 5. PRE REGISTER (Next School Year)
                $preRegTotal = $nextSyId ? ApplicationForm::join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                    ->where('enrollments.school_year_id', $nextSyId)
                    ->where('application_forms.status', 'Confirmed')
                    ->count() : 0;

                // 6. YEARLY TRENDS (July - June)
                $trendLabels = [];
                $currTrendData = [];
                $prevTrendData = [];

                for ($i = 0; $i < 12; $i++) {
                    $monthNum = 7 + $i;
                    $yearOffset = 0;
                    if ($monthNum > 12) {
                        $monthNum -= 12;
                        $yearOffset = 1;
                    }
                    
                    $monthName = Carbon::create()->month($monthNum)->format('M');
                    $trendLabels[] = $monthName;

                    // Current SY Date Range for this month
                    $currYearMonth = ($startYear + $yearOffset);
                    $currStart = Carbon::create($currYearMonth, $monthNum, 1)->startOfDay();
                    $currEnd = $currStart->copy()->endOfMonth()->endOfDay();

                    // Previous SY Date Range for this month
                    $prevYearMonth = ($startYear - 1 + $yearOffset);
                    $prevStart = Carbon::create($prevYearMonth, $monthNum, 1)->startOfDay();
                    $prevEnd = $prevStart->copy()->endOfMonth()->endOfDay();

                    // Query Count
                    $currAppCount = ApplicationForm::whereBetween('created_at', [$currStart, $currEnd])->count();
                    $currCancelRegCount = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                        ->whereBetween('cancelled_at', [$currStart, $currEnd])
                        ->count();
                    
                    $prevAppCount = ApplicationForm::whereBetween('created_at', [$prevStart, $prevEnd])->count();
                    $prevCancelRegCount = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                        ->whereBetween('cancelled_at', [$prevStart, $prevEnd])
                        ->count();
                    
                    $currTrendData[] = $currAppCount + $currCancelRegCount;
                    $prevTrendData[] = $prevAppCount + $prevCancelRegCount;
                }

                // 7. MULTI-YEAR TREND
                $yearsList = [];
                $yearsData = [];

                // Latest 5 years including current
                for ($y = 4; $y >= 0; $y--) {
                    $targetYear = $startYear - $y; 
                    $syString = $targetYear . '/' . ($targetYear + 1); 
                    
                    $sId = SchoolYear::where('year', $syString)->value('school_year_id');
                    
                    $count = 0;
                    if ($sId) {
                        $c1 = ApplicationForm::join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                            ->where('enrollments.school_year_id', $sId)
                            ->count();
                        $c2 = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                            ->where('school_year_id', $sId)
                            ->count();
                        $count = $c1 + $c2;
                    }
                    
                    $yearsList[] = $syString;
                    $yearsData[] = $count;
                }

                return [
                    'meta' => [
                        'filter_date' => $filterDate->toDateString(),
                        'current_sy' => $currentSyName,
                        'previous_sy' => $prevSyName
                    ],
                    'global' => [
                        'total' => $totalRegistrations,
                        'total_growth' => $this->calculateGrowth($totalRegistrations, $prevTotalRegistrations),
                        'confirmed' => $totalConfirmed,
                        'confirmed_growth' => $this->calculateGrowth($totalConfirmed, $prevTotalConfirmed),
                        'cancelled' => $totalCancelled,
                        'cancelled_growth' => $this->calculateGrowth($totalCancelled, $prevGlobalTotalCancelled),
                    ],
                    'today' => [
                        'all' => [
                            'total' => $todayData['total'],
                            'growth' => $this->calculateGrowth($todayData['total'], $yesterdayData['total']),
                            'confirmed' => $todayData['confirmed'],
                            'growth_confirmed' => $this->calculateGrowth($todayData['confirmed'], $yesterdayData['confirmed']),
                            'cancelled' => $todayData['cancelled'],
                            'growth_cancelled' => $this->calculateGrowth($todayData['cancelled'], $yesterdayData['cancelled']),
                        ],
                        'new' => [
                            'total' => $todayData['new_total'],
                            'growth' => $this->calculateGrowth($todayData['new_total'], $yesterdayData['new_total']),
                            'confirmed' => $todayData['new_confirmed'],
                            'growth_confirmed' => $this->calculateGrowth($todayData['new_confirmed'], $yesterdayData['new_confirmed']),
                            'cancelled' => $todayData['new_cancelled'],
                            'growth_cancelled' => $this->calculateGrowth($todayData['new_cancelled'], $yesterdayData['new_cancelled']),
                        ],
                        'transferee' => [
                            'total' => $todayData['trans_total'],
                            'growth' => $this->calculateGrowth($todayData['trans_total'], $yesterdayData['trans_total']),
                            'confirmed' => $todayData['trans_confirmed'],
                            'growth_confirmed' => $this->calculateGrowth($todayData['trans_confirmed'], $yesterdayData['trans_confirmed']),
                            'cancelled' => $todayData['trans_cancelled'],
                            'growth_cancelled' => $this->calculateGrowth($todayData['trans_cancelled'], $yesterdayData['trans_cancelled']),
                        ],
                        'returning' => [
                            'total' => $todayData['old_total'],
                            'growth' => $this->calculateGrowth($todayData['old_total'], $yesterdayData['old_total']),
                            'confirmed' => $todayData['old_confirmed'],
                            'growth_confirmed' => $this->calculateGrowth($todayData['old_confirmed'], $yesterdayData['old_confirmed']),
                            'cancelled' => $todayData['old_cancelled'],
                            'growth_cancelled' => $this->calculateGrowth($todayData['old_cancelled'], $yesterdayData['old_cancelled']),
                        ],
                    ],
                    'school_year' => [
                        'all' => [
                            'total' => $currSyTotal,
                            'growth' => $this->calculateGrowth($currSyTotal, $prevSyTotal),
                            'confirmed' => $currSyConfirmed,
                            'growth_confirmed' => $this->calculateGrowth($currSyConfirmed, $prevSyConfirmed),
                            'cancelled' => $currSyCancelledTotal,
                            'growth_cancelled' => $this->calculateGrowth($currSyCancelledTotal, $prevSyCancelledTotal),
                        ],
                        'new' => [
                            'total' => $currSyNewTotal, 
                            'growth' => $this->calculateGrowth($currSyNewTotal, $prevSyNewTotal),
                            'confirmed' => $currSyNewConfirmed,
                            'growth_confirmed' => $this->calculateGrowth($currSyNewConfirmed, $prevSyNewConfirmed),
                            'cancelled' => $currSyNewCancelled,
                            'growth_cancelled' => $this->calculateGrowth($currSyNewCancelled, $prevSyNewCancelled),
                        ],
                        'transferee' => [
                            'total' => $currSyTransTotal,
                            'growth' => $this->calculateGrowth($currSyTransTotal, $prevSyTransTotal),
                            'confirmed' => $currSyTransConfirmed,
                            'growth_confirmed' => $this->calculateGrowth($currSyTransConfirmed, $prevSyTransConfirmed),
                            'cancelled' => $currSyTransCancelled,
                            'growth_cancelled' => $this->calculateGrowth($currSyTransCancelled, $prevSyTransCancelled),
                        ],
                        'returning' => [
                            'total' => $currSyOldTotal,
                            'growth' => $this->calculateGrowth($currSyOldTotal, $prevSyOldTotal),
                            'confirmed' => $currSyOldConfirmed,
                            'growth_confirmed' => $this->calculateGrowth($currSyOldConfirmed, $prevSyOldConfirmed),
                            'cancelled' => $currSyOldCancelled,
                            'growth_cancelled' => $this->calculateGrowth($currSyOldCancelled, $prevSyOldCancelled),
                        ]
                    ],
                    'active_students_matrix' => $activeStudents,
                    'pre_register' => $preRegTotal,
                    'trends' => [
                        'labels' => $trendLabels,
                        'current_data' => $currTrendData,
                        'previous_data' => $prevTrendData,
                        'current_label' => $currentSyName,
                        'previous_label' => $prevSyName
                    ],
                    'multi_year_trend' => [
                        'labels' => $yearsList,
                        'data' => $yearsData
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            \Log::error('Analytics Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error loading analytics'], 500);
        }
    }
}