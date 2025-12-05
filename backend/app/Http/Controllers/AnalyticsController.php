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
            $now = Carbon::now();
            $dateKey = $now->format('Y-m-d');

            $currentYearInt = $now->year;
            $startYear = $now->month >= 7 ? $currentYearInt : $currentYearInt - 1;

            $currentSyName = $startYear . '/' . ($startYear + 1);
            $prevSyName = ($startYear - 1) . '/' . $startYear;
            $nextSyName = ($startYear + 1) . '/' . ($startYear + 2);

            // Cache Key
            $cacheKey = 'analytics_full_' . $dateKey;
            $cacheTime = now()->addHours(24);

            $data = Cache::remember($cacheKey, $cacheTime, function () use ($now, $dateKey, $currentSyName, $prevSyName, $nextSyName, $startYear) {
                $startOfDay = $now->copy()->startOfDay();
                $endOfDay = $now->copy()->endOfDay();
                $yesterdayStart = $now->copy()->subDay()->startOfDay();
                $yesterdayEnd = $now->copy()->subDay()->endOfDay();
                
                $sections = [
                    'ECP' => ['ecp'], 
                    'Elementary School' => ['elementary'], 
                    'Middle School' => ['middle'], 
                    'High School' => ['high']
                ];
                
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

                // 2. TODAY REGISTRATION, CURRENT SCHOOL YEAR, PRE-REGISTER
                $v = fn($obj, $prop) => (int)($obj->$prop ?? 0);

                $countCancTable = function($status, $dates = null, $syId = null) {
                    $q = CancelledRegistration::where('student_status', $status)
                        ->where('reason', 'Cancellation of Enrollment');
                    
                    if ($syId) $q->where('school_year_id', $syId);
                    if ($dates) $q->whereBetween('cancelled_at', $dates);
                    
                    return $q->count();
                };

                $queryStats = function($dates = null, $syId = null) {
                    if (!$dates && !$syId) return null; 

                    $q = DB::table('application_forms')
                        ->join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id');

                    if ($syId) $q->where('enrollments.school_year_id', $syId);
                    elseif ($dates) $q->whereBetween('application_forms.created_at', $dates);

                    return $q->selectRaw('
                        SUM(CASE WHEN application_forms.status = "Confirmed" THEN 1 ELSE 0 END) as confirmed,
                        SUM(CASE WHEN application_forms.status = "Cancelled" THEN 1 ELSE 0 END) as cancelled_af,
                        
                        -- New
                        SUM(CASE WHEN enrollments.student_status = "New" THEN 1 ELSE 0 END) as new_total, -- Note: This is raw count in app_form
                        SUM(CASE WHEN enrollments.student_status = "New" AND application_forms.status = "Confirmed" THEN 1 ELSE 0 END) as new_confirmed,
                        SUM(CASE WHEN enrollments.student_status = "New" AND application_forms.status = "Cancelled" THEN 1 ELSE 0 END) as new_cancelled_af,
                        
                        -- Transferee
                        SUM(CASE WHEN enrollments.student_status = "Transferee" THEN 1 ELSE 0 END) as trans_total,
                        SUM(CASE WHEN enrollments.student_status = "Transferee" AND application_forms.status = "Confirmed" THEN 1 ELSE 0 END) as trans_confirmed,
                        SUM(CASE WHEN enrollments.student_status = "Transferee" AND application_forms.status = "Cancelled" THEN 1 ELSE 0 END) as trans_cancelled_af
                    ')->first();
                };

                $calculateFinalStats = function($rawStats, $cancNew, $cancTrans) use ($v) {
                    if (!$rawStats) {
                        $z = ['total' => 0, 'confirmed' => 0, 'cancelled' => 0];
                        return ['all' => $z, 'new' => $z, 'transferee' => $z, 'returning' => $z];
                    }

                    // A. New Students
                    $newConfirmed = $v($rawStats, 'new_confirmed');
                    $newCancelled = $v($rawStats, 'new_cancelled_af') + $cancNew;
                    $newTotal     = $newConfirmed + $newCancelled;

                    // B. Transferee Students
                    $transConfirmed = $v($rawStats, 'trans_confirmed');
                    $transCancelled = $v($rawStats, 'trans_cancelled_af') + $cancTrans;
                    $transTotal     = $transConfirmed + $transCancelled;

                    // C. Grand Total (Sum of all parts)
                    $grandConfirmed = $v($rawStats, 'confirmed');
                    $grandCancelled = $v($rawStats, 'cancelled_af') + $cancNew + $cancTrans;
                    $grandTotal     = $grandConfirmed + $grandCancelled;

                    // Old = Total - (New + Transferee)
                    $oldTotal     = max(0, $grandTotal - ($newTotal + $transTotal));
                    $oldConfirmed = max(0, $grandConfirmed - ($newConfirmed + $transConfirmed));
                    $oldCancelled = max(0, $oldTotal - $oldConfirmed);

                    // Calculate Percentage Helper
                    $calcPct = fn($val, $total) => $total > 0 ? round(($val / $total) * 100, 2) : 0;
                    $pctAll = $grandTotal > 0 ? 100 : 0;
                    $pctNew = $calcPct($newTotal, $grandTotal);
                    $pctTrans = $calcPct($transTotal, $grandTotal);
                    $pctOld = $calcPct($oldTotal, $grandTotal);

                    return [
                        'all' => ['total' => $grandTotal, 'confirmed' => $grandConfirmed, 'cancelled' => $grandCancelled, 'percentage' => $pctAll],
                        'new' => ['total' => $newTotal, 'confirmed' => $newConfirmed, 'cancelled' => $newCancelled, 'percentage' => $pctNew],
                        'transferee' => ['total' => $transTotal, 'confirmed' => $transConfirmed, 'cancelled' => $transCancelled, 'percentage' => $pctTrans],
                        'returning' => ['total' => $oldTotal, 'confirmed' => $oldConfirmed, 'cancelled' => $oldCancelled, 'percentage' => $pctOld]
                    ];
                };

                // 1. TODAY DATA
                $todayStats = $calculateFinalStats(
                    $queryStats([$startOfDay, $endOfDay], null),
                    $countCancTable('New', [$startOfDay, $endOfDay]),
                    $countCancTable('Transferee', [$startOfDay, $endOfDay])
                );

                // 2. YESTERDAY DATA (For Growth)
                $yesterdayStats = $calculateFinalStats(
                    $queryStats([$yesterdayStart, $yesterdayEnd], null),
                    $countCancTable('New', [$yesterdayStart, $yesterdayEnd]),
                    $countCancTable('Transferee', [$yesterdayStart, $yesterdayEnd])
                );

                // 3. CURRENT SCHOOL YEAR DATA
                $currSyStats = $calculateFinalStats(
                    $queryStats(null, $currSyId),
                    $countCancTable('New', null, $currSyId),
                    $countCancTable('Transferee', null, $currSyId)
                );

                // 4. PREVIOUS SCHOOL YEAR DATA (For Growth)
                $prevSyStats = $calculateFinalStats(
                    $queryStats(null, $prevSyId),
                    $countCancTable('New', null, $prevSyId),
                    $countCancTable('Transferee', null, $prevSyId)
                );

                // 5. NEXT SCHOOL YEAR DATA (Pre-Register)
                $preRegStats = $calculateFinalStats(
                    $queryStats(null, $nextSyId),
                    $countCancTable('New', null, $nextSyId),
                    $countCancTable('Transferee', null, $nextSyId)
                );

                // ADD GROWTH METRICS
                $addGrowth = function($curr, $prev) {
                    $curr['growth'] = $this->calculateGrowth($curr['total'], $prev['total']);
                    $curr['growth_confirmed'] = $this->calculateGrowth($curr['confirmed'], $prev['confirmed']);
                    $curr['growth_cancelled'] = $this->calculateGrowth($curr['cancelled'], $prev['cancelled']);
                    return $curr;
                };

                foreach ($todayStats as $k => $v) $todayStats[$k] = $addGrowth($v, $yesterdayStats[$k]);
                foreach ($currSyStats as $k => $v) $currSyStats[$k] = $addGrowth($v, $prevSyStats[$k]);

                // 4. ACTIVE STUDENT PER SECTION
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

                $grandTotalStats = [
                    'total' => 0,
                    'total_new' => 0,
                    'total_transferee' => 0,
                    'total_returning' => 0
                ];

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

                    $grandTotalStats['total'] += $totalUnique;
                    $grandTotalStats['total_new'] += $countNew;
                    $grandTotalStats['total_transferee'] += $countTransferee;
                    $grandTotalStats['total_returning'] += $totalReturning;
                }

                $activeStudents['Total'] = $grandTotalStats;

                // 6. MONTHLY TRENDS (July - June)
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

                    // === Current year calculations ===
                    // total all
                    $currAppCount = ApplicationForm::whereBetween('created_at', [$currStart, $currEnd])->count();

                    // confirmed applications
                    $currAppConfirmed = ApplicationForm::where('status', 'Confirmed')
                        ->whereBetween('created_at', [$currStart, $currEnd])
                        ->count();
                    
                    // cancelled applications (old)
                    $currAppCancelled = ApplicationForm::where('status', 'Cancelled')
                        ->whereBetween('created_at', [$currStart, $currEnd])
                        ->count();
                    // cancelled applications (new)
                    $currCancelRegCount = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                        ->whereBetween('cancelled_at', [$currStart, $currEnd])
                        ->count();
                    
                    // === Previous year calculations ===
                    $prevAppCount = ApplicationForm::whereBetween('created_at', [$prevStart, $prevEnd])->count();

                    $prevAppConfirmed = ApplicationForm::where('status', 'Confirmed')
                        ->whereBetween('created_at', [$prevStart, $prevEnd])
                        ->count();

                    $prevAppCancelled = ApplicationForm::where('status', 'Cancelled')
                        ->whereBetween('created_at', [$prevStart, $prevEnd])
                        ->count();

                    $prevCancelRegCount = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                        ->whereBetween('cancelled_at', [$prevStart, $prevEnd])
                        ->count();
                    
                    $currTrendData[] = [
                        'month'     => $monthName,
                        'total'     => $currAppCount + $currCancelRegCount,
                        'confirmed' => $currAppConfirmed,
                        'cancelled' => $currAppCancelled + $currCancelRegCount
                    ];

                    $prevTrendData[] = [
                        'month'     => $monthName,
                        'total'     => $prevAppCount + $prevCancelRegCount,
                        'confirmed' => $prevAppConfirmed,
                        'cancelled' => $prevAppCancelled + $prevCancelRegCount
                    ];
                }

                // 7. MULTI-YEAR TREND
                $yearsList = [];
                $yearsData = [];

                // Latest 5 years including current
                for ($y = 4; $y >= 0; $y--) {
                    $targetYear = $startYear - $y; 
                    $syString = $targetYear . '/' . ($targetYear + 1); 
                    
                    $sId = SchoolYear::where('year', $syString)->value('school_year_id');
                    
                    $countTotal = 0;
                    $countConfirmed = 0;
                    $countCancelled = 0;
                    
                    if ($sId) {
                        $baseAppQuery = ApplicationForm::join('enrollments', 'application_forms.enrollment_id', '=', 'enrollments.enrollment_id')
                            ->where('enrollments.school_year_id', $sId);

                        // 1. Total Application Forms
                        $c1 = (clone $baseAppQuery)->count();

                        // 2. Confirmed Application Forms
                        $cConfirmed = (clone $baseAppQuery)->where('application_forms.status', 'Confirmed')->count();

                        // 3. Cancelled Application Forms (old)
                        $cAppCancelled = (clone $baseAppQuery)->where('application_forms.status', 'Cancelled')->count();

                        // 4. Cancelled Registrations (new)
                        $c2 = CancelledRegistration::where('reason', 'Cancellation of Enrollment')
                            ->where('school_year_id', $sId)
                            ->count();

                        $countTotal = $c1 + $c2;
                        $countConfirmed = $cConfirmed;
                        $countCancelled = $cAppCancelled + $c2;
                    }
                    
                    $yearsList[] = $syString;
                    $yearsData[] = [
                        'school_year' => $syString,
                        'total'     => $countTotal,
                        'confirmed' => $countConfirmed,
                        'cancelled' => $countCancelled
                    ];
                }

                // 8. Enrollment unique student (Global & Brakedown)
                $historicalEnrollments = DB::table('enrollments')
                    ->join('application_forms', 'enrollments.enrollment_id', '=', 'application_forms.enrollment_id')
                    ->join('sections', 'enrollments.section_id', '=', 'sections.section_id')
                    ->join('students', 'enrollments.id', '=', 'students.id') 
                    ->where(function($query) {
                        $query->where('application_forms.status', 'Confirmed')
                                ->orWhere(function($subQuery) {
                                    $subQuery->where('application_forms.status', 'Cancelled')
                                            ->whereIn('students.status', ['Graduate', 'Expelled', 'Withdraw']);
                                });
                    })
                    ->select(
                        'students.id as student_id',
                        'sections.name as section_name',
                        'students.active',          
                        'students.status as student_status'
                    )
                    ->get();
                
                    $uniqueEnrollmentKeys = []; 

                    $globalStats = [
                        'total' => 0, 'active' => 0, 'graduate' => 0, 
                        'expelled' => 0, 'withdraw' => 0, 'unknown' => 0
                    ];

                    $sectionStats = [];
                    foreach ($sections as $label => $val) {
                        $sectionStats[$label] = [
                            'total' => 0, 'active' => 0, 'graduate' => 0, 
                            'expelled' => 0, 'withdraw' => 0, 'unknown' => 0
                        ];
                    }

                    foreach ($historicalEnrollments as $record) {
                        $groupName = 'Other';
                        foreach ($sections as $label => $keywords) {
                            foreach ($keywords as $k) {
                                if (stripos($record->section_name, $k) !== false) {
                                    $groupName = $label;
                                    break 2;
                                }
                            }
                        }

                        $compositeKey = $record->student_id . '_' . $groupName;

                        if (!isset($uniqueEnrollmentKeys[$compositeKey])) {
                            $uniqueEnrollmentKeys[$compositeKey] = true;

                            $type = 'unknown'; // default
                            
                            if ($record->active === 'YES') {
                                $type = 'active';
                            } else {
                                $st = strtolower($record->student_status ?? '');
                                if (str_contains($st, 'graduate')) {
                                    $type = 'graduate';
                                } elseif (str_contains($st, 'expel')) {
                                    $type = 'expelled';
                                } elseif (str_contains($st, 'withdraw')) {
                                    $type = 'withdraw';
                                } else {
                                    $type = 'unknown';
                                }
                            }

                            $globalStats['total']++;
                            $globalStats[$type]++;

                            // INCREMENT PER SECTION 
                            if (isset($sectionStats[$groupName])) {
                                $sectionStats[$groupName]['total']++;
                                $sectionStats[$groupName][$type]++;
                            }
                        }
                    }

                    $enrollmentFinal = [
                        'summary' => $globalStats,       
                        'breakdown' => $sectionStats
                    ];

                return [
                    'meta' => [
                        'date' => $dateKey,
                        'current_sy' => $currentSyName,
                        'previous_sy' => $prevSyName,
                        'next_sy' => $nextSyName
                    ],
                    'global' => [
                        'total' => $totalRegistrations,
                        'total_growth' => $this->calculateGrowth($totalRegistrations, $prevTotalRegistrations),
                        'confirmed' => $totalConfirmed,
                        'confirmed_growth' => $this->calculateGrowth($totalConfirmed, $prevTotalConfirmed),
                        'cancelled' => $totalCancelled,
                        'cancelled_growth' => $this->calculateGrowth($totalCancelled, $prevGlobalTotalCancelled),
                    ],
                    'today' => $todayStats,
                    'school_year' => $currSyStats,
                    'pre_register' => $preRegStats,
                    'active_students_matrix' => $activeStudents,
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
                    ],
                    'enrollment_unique_students' => $enrollmentFinal,
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