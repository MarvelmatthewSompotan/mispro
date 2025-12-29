<?php

namespace App\Http\Controllers\Gates;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Gate\GateAttendance;
use App\Models\Gate\GateAssignment;
use App\Models\Gate\GateParentNotification;
use App\Models\Gate\GatePoint;
use App\Models\Gate\GateScanLog;
use App\Models\Gate\GateSession;
use App\Models\SchoolYear;
use App\Models\Student;
use App\Jobs\SendGateParentNotificationJob;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class GateManagementController extends Controller
{
    public function indexGatePoints(): JsonResponse
    {
        $points = GatePoint::orderBy('name')->get();

        return response()->json([
            'data' => $points,
        ]);
    }

    public function storeGatePoint(): JsonResponse
    {
        $name = $this->generateNextGateName();

        $gatePoint = GatePoint::create([
            'name' => $name,
        ]);

        return response()->json([
            'message' => 'Gate point created.',
            'data' => $gatePoint,
        ], 201);
    }

    public function endSession(Request $request, $sessionId): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role;

        if (!$user || !in_array($role, ['security', 'gate_display'], true)) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $assignment = GateAssignment::with('gatePoint')
            ->where('user_id', $user->user_id)
            ->where('assignment_type', $role)
            ->first();

        if (!$assignment || !$assignment->gatePoint) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $session = GateSession::where('gate_session_id', $sessionId)
            ->where('gate_point_id', $assignment->gate_point_id)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Session not found for this gate.',
            ], 404);
        }

        if ($session->status === 'Ended') {
            return response()->json([
                'message' => 'Session already ended.',
            ], 422);
        }

        $session->update([
            'status' => 'Ended',
            'end_at' => Carbon::now(),
            'ended_by' => $request->user()?->user_id,
        ]);

        return response()->json([
            'message' => 'Gate session ended.',
            'data' => $session,
        ]);
    }

    public function updateThresholds(Request $request, $sessionId): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role;

        if ($role !== 'security') {
            return response()->json([
                'message' => 'Only security role can update thresholds.',
            ], 403);
        }

        $assignment = GateAssignment::with('gatePoint')
            ->where('user_id', $user->user_id)
            ->where('assignment_type', $role)
            ->first();

        if (!$assignment || !$assignment->gatePoint) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $session = GateSession::where('gate_session_id', $sessionId)
            ->where('gate_point_id', $assignment->gate_point_id)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Session not found for this gate.',
            ], 404);
        }

        if ($session->status === 'Ended') {
            return response()->json([
                'message' => 'Cannot update thresholds for an ended session.',
            ], 422);
        }

        $data = $request->validate([
            'entry_threshold' => 'nullable|date_format:H:i',
            'exit_threshold' => 'nullable|date_format:H:i',
            'section_thresholds' => 'sometimes|array',
            'section_thresholds.*' => 'nullable|date_format:H:i',
        ]);

        $sectionThresholds = $data['section_thresholds'] ?? null;
        unset($data['section_thresholds']);

        if (is_array($sectionThresholds)) {
            $sectionThresholds = array_filter($sectionThresholds, function ($value) {
                return $value !== null && $value !== '';
            });
        }

        $updateData = $data;
        if ($sectionThresholds !== null) {
            $updateData['exit_threshold_map'] = $sectionThresholds;
        }

        $session->update($updateData);

        return response()->json([
            'message' => 'Thresholds updated.',
            'data' => $session,
        ]);
    }

    public function currentSession(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role;

        if (!$user || !in_array($role, ['security', 'gate_display'], true)) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $assignment = GateAssignment::with('gatePoint')
            ->where('user_id', $user->user_id)
            ->where('assignment_type', $role)
            ->first();

        if (!$assignment || !$assignment->gatePoint) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $session = GateSession::where('status', 'Ongoing')
            ->where('gate_point_id', $assignment->gate_point_id)
            ->orderByDesc('session_date')
            ->orderByDesc('gate_session_id')
            ->first();

        return response()->json([
            'data' => $session,
            'message' => $session ? null : 'No active session.',
        ]);
    }

    public function currentAttendances(Request $request)
    {
        $user = $request->user();
        $role = $user?->role;

        if (!$user || !in_array($role, ['security', 'gate_display'], true)) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $assignment = GateAssignment::with('gatePoint')
            ->where('user_id', $user->user_id)
            ->where('assignment_type', $role)
            ->first();

        if (!$assignment || !$assignment->gatePoint) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $session = GateSession::where('status', 'Ongoing')
            ->where('gate_point_id', $assignment->gate_point_id)
            ->whereDate('session_date', Carbon::now(config('app.timezone'))->toDateString())
            ->orderByDesc('gate_session_id')
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'No active session.',
                'data' => [],
            ], 422);
        }

        $this->ensureSessionRoster($session);

        $lastScanSub = DB::table('gate_scan_logs as gsl')
            ->select('gsl.gate_attendance_id', 'gsl.scan_type', 'gsl.scan_time')
            ->join(DB::raw('(SELECT gate_attendance_id, MAX(scan_time) AS max_time FROM gate_scan_logs GROUP BY gate_attendance_id) gl_max'), function ($join) {
                $join->on('gsl.gate_attendance_id', '=', 'gl_max.gate_attendance_id')
                    ->on('gsl.scan_time', '=', 'gl_max.max_time');
            });

        // Global last scan per student (lintas sesi/hari)
        $globalLastScanSub = null; // removed to simplify current attendances

        $query = GateAttendance::where('gate_session_id', $session->gate_session_id)
            ->leftJoinSub($lastScanSub, 'last_scan', function ($join) {
                $join->on('last_scan.gate_attendance_id', '=', 'gate_attendance_records.gate_attendance_id');
            })
            ->leftJoin('students', 'students.id', '=', 'gate_attendance_records.student_id')
            ->select(
                'gate_attendance_records.*',
                'students.student_id as student_code',
                'last_scan.scan_type as last_scan_type',
                'last_scan.scan_time as last_scan_time'
            );

        if ($request->filled('name')) {
            $query->where('student_name', 'like', '%'.$request->name.'%');
        }

        if ($request->filled('grades')) {
            $query->whereIn('student_grade', (array) $request->grades);
        }

        if ($request->filled('sections')) {
            $query->whereIn('student_section', (array) $request->sections);
        }

        if ($request->filled('entry_status')) {
            $query->whereIn('entry_status', (array) $request->entry_status);
        }

        if ($request->filled('exit_status')) {
            $query->whereIn('exit_status', (array) $request->exit_status);
        }

        $sortable = [
            'student_name',
            'student_grade',
            'student_section',
            'check_in_at',
            'check_out_at',
            'entry_status',
            'exit_status',
        ];

        $sortBy = $request->get('sort_by', 'student_name');
        if (!in_array($sortBy, $sortable, true)) {
            $sortBy = 'student_name';
        }

        $sortDir = $request->get('sort_dir', 'asc');
        $sortDir = $sortDir === 'desc' ? 'desc' : 'asc';

        if ($sortBy === 'student_section') {
            $query->orderByRaw("
                CASE student_section
                    WHEN 'ECP' THEN 1
                    WHEN 'Elementary' THEN 2
                    WHEN 'MS' THEN 3
                    WHEN 'HS' THEN 4
                    ELSE 5
                END $sortDir
            ");
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        $gatePoints = GatePoint::pluck('name', 'gate_point_id');

        $attendances = $query->paginate($request->get('per_page', 25));

        $attendances->getCollection()->transform(function ($attendance) use ($gatePoints) {
            // Gunakan student_code sebagai student_id untuk output (bukan FK internal)
            $attendance->student_id = $attendance->student_code ?? $attendance->student_id;
            $attendance->entry_gate = $attendance->entry_gate_id ? ($gatePoints[$attendance->entry_gate_id] ?? $attendance->entry_gate_id) : null;
            $attendance->exit_gate = $attendance->exit_gate_id ? ($gatePoints[$attendance->exit_gate_id] ?? $attendance->exit_gate_id) : null;

            // last_activity not needed here; focus on roster/status
            unset($attendance->last_scan_type, $attendance->last_scan_time, $attendance->student_code);
            return $attendance;
        });

        return response()->json($attendances);
    }

    public function displayState(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role;

        $gatePoint = null;
        if ($user && in_array($role, ['security', 'gate_display'], true)) {
            $assignment = GateAssignment::with('gatePoint')
                ->where('user_id', $user->user_id)
                ->where('assignment_type', $role)
                ->first();

            if (!$assignment || !$assignment->gatePoint) {
                return response()->json([
                    'message' => 'Gate assignment not found for this user.',
                ], 422);
            }

            $gatePoint = $assignment->gatePoint;
        } elseif ($request->filled('gate_point_id')) {
            $gatePoint = GatePoint::find($request->gate_point_id);
            if (!$gatePoint) {
                return response()->json([
                    'message' => 'Gate point not found.',
                ], 404);
            }
        } else {
            return response()->json([
                'message' => 'Gate point is required.',
            ], 422);
        }

        $session = GateSession::where('status', 'Ongoing')
            ->where('gate_point_id', $gatePoint->gate_point_id)
            ->whereDate('session_date', Carbon::now(config('app.timezone'))->toDateString())
            ->orderByDesc('gate_session_id')
            ->first();

        if (!$session) {
            return response()->json([
                'gate' => [
                    'gate_point_id' => $gatePoint->gate_point_id,
                    'name' => $gatePoint->name,
                ],
                'session' => null,
                'last_scan' => null,
                'message' => 'No active gate session.',
            ], 422);
        }

        $latestLog = GateScanLog::with('attendance')
            ->where('gate_session_id', $session->gate_session_id)
            ->orderByDesc('scan_time')
            ->first();

        $attendance = $latestLog?->attendance;
        $lastScan = null;

        if ($attendance) {
            $previousLog = GateScanLog::join('gate_attendance_records as gar', 'gar.gate_attendance_id', '=', 'gate_scan_logs.gate_attendance_id')
                ->where('gar.student_id', $attendance->student_id)
                ->where('gate_scan_logs.scan_time', '<', $latestLog->scan_time)
                ->orderByDesc('gate_scan_logs.scan_time')
                ->first(['gate_scan_logs.scan_type', 'gate_scan_logs.scan_time']);

            $lastActivityType = $previousLog->scan_type ?? $latestLog->scan_type;
            $lastActivityTime = $previousLog->scan_time ?? $latestLog->scan_time;

            $lastScan = [
                'scan_type' => $latestLog->scan_type,
                'scan_time' => optional($latestLog->scan_time)->toDateTimeString(),
                'student_id' => $attendance->student?->student_id ?? $attendance->student_id,
                'student_name' => $attendance->student_name,
                'grade' => $attendance->student_grade,
                'section' => $attendance->student_section,
                'residency_status' => $attendance->residency_status,
                'card_number' => $attendance->card_number,
                'entry_status' => $attendance->entry_status,
                'exit_status' => $attendance->exit_status,
                'check_in_at' => optional($attendance->check_in_at)->toDateTimeString(),
                'check_out_at' => optional($attendance->check_out_at)->toDateTimeString(),
                'last_activity' => $lastActivityType,
                'last_activity_time' => $lastActivityTime ? optional($lastActivityTime)->toDateTimeString() : null,
            ];
        }

        return response()->json([
            'gate' => [
                'gate_point_id' => $gatePoint->gate_point_id,
                'name' => $gatePoint->name,
            ],
            'session' => [
                'gate_session_id' => $session->gate_session_id,
                'session_date' => $session->session_date,
                'status' => $session->status,
                'entry_threshold' => $session->entry_threshold,
                'exit_threshold' => $session->exit_threshold,
            ],
            'last_scan' => $lastScan,
        ]);
    }

    public function pastSessions(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role;

        if (!$user || !in_array($role, ['security', 'gate_display'], true)) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $assignment = GateAssignment::with('gatePoint')
            ->where('user_id', $user->user_id)
            ->where('assignment_type', $role)
            ->first();

        if (!$assignment || !$assignment->gatePoint) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $query = GateSession::where('gate_point_id', $assignment->gate_point_id);

        if ($request->filled('status')) {
            $query->whereIn('status', (array) $request->status);
        } else {
            $query->where('status', 'Ended');
        }

        $sortable = [
            'session_date',
            'check_in_count',
            'check_out_count',
            'status',
        ];

        $sortBy = $request->get('sort_by', 'session_date');
        if (!in_array($sortBy, $sortable, true)) {
            $sortBy = 'session_date';
        }

        $sortDir = $request->get('sort_dir', 'desc');
        $sortDir = $sortDir === 'asc' ? 'asc' : 'desc';

        $sessions = $query
            ->orderBy($sortBy, $sortDir)
            ->paginate($request->get('per_page', 25));

        return response()->json($sessions);
    }

    public function sessionDetail($sessionId, Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role;

        if (!$user || !in_array($role, ['security', 'gate_display'], true)) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $assignment = GateAssignment::with('gatePoint')
            ->where('user_id', $user->user_id)
            ->where('assignment_type', $role)
            ->first();

        if (!$assignment || !$assignment->gatePoint) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $session = GateSession::with('attendances')
            ->where('gate_session_id', $sessionId)
            ->where('gate_point_id', $assignment->gate_point_id)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Session not found for this gate.',
            ], 404);
        }

        $gatePoints = GatePoint::pluck('name', 'gate_point_id');
        $studentCodes = Student::whereIn('id', $session->attendances->pluck('student_id'))
            ->pluck('student_id', 'id');

        $session->attendances->transform(function ($attendance) use ($gatePoints, $studentCodes) {
            $attendance->student_id = $studentCodes[$attendance->student_id] ?? $attendance->student_id;
            $attendance->entry_gate = $attendance->entry_gate_id ? ($gatePoints[$attendance->entry_gate_id] ?? $attendance->entry_gate_id) : null;
            $attendance->exit_gate = $attendance->exit_gate_id ? ($gatePoints[$attendance->exit_gate_id] ?? $attendance->exit_gate_id) : null;
            return $attendance;
        });

        return response()->json([
            'data' => $session,
        ]);
    }

    public function sessionAttendances($sessionId, Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role;

        if (!$user || !in_array($role, ['security', 'gate_display'], true)) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $assignment = GateAssignment::with('gatePoint')
            ->where('user_id', $user->user_id)
            ->where('assignment_type', $role)
            ->first();

        if (!$assignment || !$assignment->gatePoint) {
            return response()->json([
                'message' => 'Gate assignment not found for this user.',
            ], 422);
        }

        $session = GateSession::where('gate_session_id', $sessionId)
            ->where('gate_point_id', $assignment->gate_point_id)
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Session not found for this gate.',
            ], 404);
        }

        $this->ensureSessionRoster($session);

        $gatePoints = GatePoint::pluck('name', 'gate_point_id');

        $query = GateAttendance::where('gate_session_id', $session->gate_session_id)
            ->leftJoin('students', 'students.id', '=', 'gate_attendance_records.student_id')
            ->select(
                'gate_attendance_records.*',
                'students.student_id as student_code'
            );

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('name')) {
            $query->where('student_name', 'like', '%'.$request->name.'%');
        }

        if ($request->filled('grades')) {
            $query->whereIn('student_grade', (array) $request->grades);
        }

        if ($request->filled('sections')) {
            $query->whereIn('student_section', (array) $request->sections);
        }

        if ($request->filled('entry_status')) {
            $query->whereIn('entry_status', (array) $request->entry_status);
        }

        if ($request->filled('exit_status')) {
            $query->whereIn('exit_status', (array) $request->exit_status);
        }

        $sortable = [
            'student_id',
            'student_name',
            'student_grade',
            'student_section',
            'check_in_at',
            'check_out_at',
            'entry_status',
            'exit_status',
        ];

        $sortBy = $request->get('sort_by', 'student_name');
        if (!in_array($sortBy, $sortable, true)) {
            $sortBy = 'student_name';
        }

        $sortDir = $request->get('sort_dir', 'asc');
        $sortDir = $sortDir === 'desc' ? 'desc' : 'asc';

        if ($sortBy === 'student_section') {
            $query->orderByRaw("
                CASE student_section
                    WHEN 'ECP' THEN 1
                    WHEN 'ES' THEN 2
                    WHEN 'MS' THEN 3
                    WHEN 'HS' THEN 4
                    ELSE 5
                END $sortDir
            ");
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        $attendances = $query->paginate($request->get('per_page', 25));

        $attendances->getCollection()->transform(function ($attendance) use ($gatePoints) {
            $attendance->student_id = $attendance->student_code ?? $attendance->student_id;
            $attendance->entry_gate = $attendance->entry_gate_id ? ($gatePoints[$attendance->entry_gate_id] ?? $attendance->entry_gate_id) : null;
            $attendance->exit_gate = $attendance->exit_gate_id ? ($gatePoints[$attendance->exit_gate_id] ?? $attendance->exit_gate_id) : null;
            unset($attendance->student_code);
            return $attendance;
        });

        return response()->json($attendances);
    }

    public function exportSession($sessionId): JsonResponse
    {
        $session = GateSession::findOrFail($sessionId);

        $gatePoints = GatePoint::pluck('name', 'gate_point_id');

        $rawAttendances = GateAttendance::where('gate_session_id', $session->gate_session_id)
            ->orderBy('student_name')
            ->get();

        $studentCodes = Student::whereIn('id', $rawAttendances->pluck('student_id'))
            ->pluck('student_id', 'id');

        $attendances = $rawAttendances
            ->values()
            ->map(function ($attendance, $index) use ($gatePoints, $studentCodes) {
                return [
                    'no' => $index + 1,
                    'student_id' => $studentCodes[$attendance->student_id] ?? $attendance->student_id,
                    'student_name' => $attendance->student_name,
                    'grade' => $attendance->student_grade,
                    'section' => $attendance->student_section,
                    'check_in' => optional($attendance->check_in_at)->format('H:i'),
                    'check_out' => optional($attendance->check_out_at)->format('H:i'),
                    'entry_status' => $attendance->entry_status,
                    'exit_status' => $attendance->exit_status,
                    'entry_gate' => $attendance->entry_gate_id ? ($gatePoints[$attendance->entry_gate_id] ?? $attendance->entry_gate_id) : null,
                    'exit_gate' => $attendance->exit_gate_id ? ($gatePoints[$attendance->exit_gate_id] ?? $attendance->exit_gate_id) : null,
                ];
            });

        return response()->json([
            'session' => [
                'id' => $session->gate_session_id,
                'date' => $session->session_date,
                'status' => $session->status,
                'entry_threshold' => $session->entry_threshold,
                'exit_threshold' => $session->exit_threshold,
            ],
            'data' => $attendances,
        ]);
    }

    public function scan(Request $request): JsonResponse
    {
        $data = $request->validate([
            'card_number' => 'required|string',
            'gate_point_id' => ['nullable', 'exists:gate_points,gate_point_id'],
            'mode' => ['required', Rule::in(['check_in', 'check_out'])],
        ]);

        $user = $request->user();
        $role = $user?->role;

        $assignedGate = null;
        if ($user && in_array($role, ['security', 'gate_display'], true)) {
            $assignment = GateAssignment::with('gatePoint')
                ->where('user_id', $user->user_id)
                ->where('assignment_type', $role)
                ->first();

            if (!$assignment || !$assignment->gatePoint) {
                return response()->json([
                    'message' => 'Gate assignment not found for this user.',
                ], 422);
            }

            $assignedGate = $assignment->gatePoint;
        }

        $student = Student::where('card_number', $data['card_number'])->first();

        if (!$student) {
            return response()->json([
                'message' => 'Card number not registered.',
            ], 404);
        }

        $gatePoint = $assignedGate ?? GatePoint::find($data['gate_point_id']);
        if (!$gatePoint) {
            return response()->json([
                'message' => 'Gate point is required.',
            ], 422);
        }

        $session = GateSession::where('status', 'Ongoing')
            ->where('gate_point_id', $gatePoint->gate_point_id)
            ->whereDate('session_date', Carbon::now(config('app.timezone'))->toDateString())
            ->orderByDesc('gate_session_id')
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'No active gate session.',
            ], 422);
        }

        $this->ensureSessionRoster($session);

        $attendance = GateAttendance::firstOrNew([
            'gate_session_id' => $session->gate_session_id,
            'student_id' => $student->id,
        ]);

        if (!$attendance->exists) {
            $fullName = trim("{$student->first_name} {$student->middle_name} {$student->last_name}");
            $enrollment = Enrollment::with(['schoolClass', 'section', 'residenceHall'])
                ->where('id', $student->id)
                ->orderByDesc('enrollment_id')
                ->first();

            $attendance->student_name = $fullName ?: $student->first_name;
            $attendance->student_grade = $enrollment?->schoolClass?->grade;
            $attendance->student_section = $enrollment?->section?->name;
            $attendance->residency_status = $this->resolveResidencyStatus($enrollment?->residenceHall?->type);
            $attendance->card_number = $student->card_number;
            $attendance->entry_status = 'Not Present';
            $attendance->exit_status = 'Not Checked Out';
        }

        $now = Carbon::now(config('app.timezone'));
        $mode = $data['mode'];
        $message = 'Student verified.';
        $stateUpdated = false;

        if ($mode === 'check_in') {
            if ($attendance->check_in_at) {
                $message = 'Student already checked in.';
            } else {
                if (!$attendance->entry_gate_id) {
                    $attendance->entry_gate_id = $gatePoint->gate_point_id;
                }
                $attendance->check_in_at = $now;
                $threshold = $session->entry_threshold
                    ? Carbon::parse($session->entry_threshold, config('app.timezone'))
                    : null;
                $attendance->entry_status = (!$threshold || $now->lte($threshold)) ? 'Present' : 'Late';
                $session->increment('check_in_count');

                $attendance->last_scan_type = 'Check In';
                $stateUpdated = true;
            }
        } else {
            if ($attendance->check_out_at) {
                $message = 'Student already checked out.';
            } else {
                if (!$attendance->exit_gate_id) {
                    $attendance->exit_gate_id = $gatePoint->gate_point_id;
                }
                $attendance->check_out_at = $now;
                $threshold = $this->resolveSectionExitThreshold($session, $attendance->student_section);
                if (!$threshold || $now->gte($threshold)) {
                    $attendance->exit_status = 'Checked Out';
                } else {
                    $attendance->exit_status = 'Early Leave';
                }
                $session->increment('check_out_count');

                $attendance->last_scan_type = 'Check Out';
                $stateUpdated = true;
            }
        }

        if ($stateUpdated && $attendance->isDirty()) {
            $attendance->save();
        } elseif ($attendance->wasRecentlyCreated) {
            // ensure new attendance is persisted even if no state update (edge case)
            $attendance->save();
        }

        if ($stateUpdated) {
            GateScanLog::create([
                'gate_attendance_id' => $attendance->gate_attendance_id,
                'gate_session_id' => $session->gate_session_id,
                'gate_point_id' => $gatePoint->gate_point_id,
                'scan_type' => $mode === 'check_in' ? 'Check In' : 'Check Out',
                'scan_time' => $now,
                'card_number' => $student->card_number,
                'payload' => null,
            ]);

            $parent = $student->studentParent()->first();
            $fallbackContacts = array_filter([
                $parent?->father_phone ?? null,
                $parent?->mother_phone ?? null,
                $student->phone_number ?? null,
            ]);

            $parentContacts = $this->resolveLatestParentContacts($student->id);
            if (empty($parentContacts)) {
                $parentContacts = $fallbackContacts;
            }

            if (!empty($parentContacts)) {
                $parentContacts = array_values(array_unique(array_filter($parentContacts)));
                if ($mode === 'check_in') {
                    $messageBody = "*Manado Independent School – Official Student Arrival Notice* \n\n"
                        ."*Dear Parent,*\n"
                        ."This message serves as an official notification that *{$attendance->student_name}* has successfully checked in at the school premises.\n\n"
                        ."*Details:*\n"
                        ."*Student Name: {$attendance->student_name}*\n"
                        ."*Section: {$attendance->student_section}*\n"
                        ."*Class: {$attendance->student_grade}*\n"
                        ."*Date: {$attendance->check_in_at?->format('d M Y')}*\n"
                        ."*Time of Arrival: {$attendance->check_in_at?->format('H:i')}*\n\n"
                        ."*We appreciate your continued cooperation.*";
                } else {
                    $messageBody = "*Manado Independent School – Official Student Departure Notice*\n\n"
                        ."*Dear Parent,*\n"
                        ."This message is to formally inform you that *{$attendance->student_name}* has checked out and has departed from the school premises.\n\n"
                        ."*Details:*\n"
                        ."*Student Name: {$attendance->student_name}*\n"
                        ."*Section: {$attendance->student_section}*\n"
                        ."*Class: {$attendance->student_grade}*\n"
                        ."*Date: {$attendance->check_out_at?->format('d M Y')}*\n"
                        ."*Time of Departure: {$attendance->check_out_at?->format('H:i')}*\n\n"
                        ."*Thank you for your trust and support.*";
                }

                foreach ($parentContacts as $recipient) {
                    $notification = GateParentNotification::create([
                        'gate_attendance_id' => $attendance->gate_attendance_id,
                        'recipient_contact' => $recipient,
                        'message_type' => $mode === 'check_in' ? 'Check In' : 'Check Out',
                        'message_body' => $messageBody,
                        'status' => 'Pending',
                        'sent_at' => null,
                        'provider_response' => null,
                    ]);

                    SendGateParentNotificationJob::dispatch($notification->notification_id);
                }
            }

            $this->syncAttendanceAcrossSessions($session, $attendance);
        }

        return response()->json([
            'message' => $message,
            'data' => [
                'student_id' => $student->student_id,
                'student_name' => $attendance->student_name,
                'grade' => $attendance->student_grade,
                'section' => $attendance->student_section,
                'residency_status' => $attendance->residency_status,
                'mode' => $mode,
                'entry_status' => $attendance->entry_status,
                'exit_status' => $attendance->exit_status,
                'check_in_at' => optional($attendance->check_in_at)->toDateTimeString(),
                'check_out_at' => optional($attendance->check_out_at)->toDateTimeString(),
            ],
        ]);
    }

    private function resolveSectionExitThreshold(GateSession $session, ?string $section): ?Carbon
    {
        $map = $session->exit_threshold_map ?? [];
        if (is_string($map)) {
            $decoded = json_decode($map, true);
            $map = is_array($decoded) ? $decoded : [];
        }

        // Normalize keys and apply alias Elementary/ES, High School/HS, Middle School/MS, ECP to avoid mismatch.
        $normalizedMap = [];
        foreach ($map as $key => $value) {
            $normKey = strtolower(trim((string) $key));
            if ($normKey === 'elementary' || $normKey === 'elementary school') {
                $normKey = 'es';
            } elseif ($normKey === 'high school' || $normKey === 'hs') {
                $normKey = 'hs';
            } elseif ($normKey === 'middle school' || $normKey === 'ms') {
                $normKey = 'ms';
            } elseif ($normKey === 'ecp') {
                $normKey = 'ecp';
            }
            if ($normKey !== '' && $value !== null && $value !== '') {
                $normalizedMap[$normKey] = $value;
            }
        }

        if ($section) {
            $sectionKey = strtolower(trim($section));
            if ($sectionKey === 'elementary' || $sectionKey === 'elementary school') {
                $sectionKey = 'es';
            } elseif ($sectionKey === 'high school' || $sectionKey === 'hs') {
                $sectionKey = 'hs';
            } elseif ($sectionKey === 'middle school' || $sectionKey === 'ms') {
                $sectionKey = 'ms';
            } elseif ($sectionKey === 'ecp') {
                $sectionKey = 'ecp';
            }
            if ($sectionKey !== '' && isset($normalizedMap[$sectionKey])) {
                return Carbon::parse($normalizedMap[$sectionKey], config('app.timezone'));
            }
        }

        return $session->exit_threshold
            ? Carbon::parse($session->exit_threshold, config('app.timezone'))
            : null;
    }

    private function ensureSessionRoster(GateSession $session): void
    {
        $students = $this->fetchLatestActiveStudents();

        foreach ($students as $student) {
            $attendance = GateAttendance::firstOrNew([
                'gate_session_id' => $session->gate_session_id,
                'student_id' => $student->id,
            ]);

            // Update profile fields to latest data
            $attendance->student_name = $student->full_name ?: $student->first_name;
            $attendance->student_grade = $student->grade;
            $attendance->student_section = $student->section_name;
            $attendance->residency_status = $this->resolveResidencyStatus($student->residence_type);
            $attendance->card_number = $student->card_number;

            if (!$attendance->exists) {
                $attendance->entry_status = 'Not Present';
                $attendance->exit_status = 'Not Checked Out';
            }

            $attendance->save();
        }
    }

    private function fetchLatestActiveStudents()
    {
        $now = Carbon::now(config('app.timezone'));
        $currentMonth = $now->month;
        $currentYear = $now->year;
        $schoolYearStr = ($currentMonth >= 7)
            ? $currentYear . '/' . ($currentYear + 1)
            : ($currentYear - 1) . '/' . $currentYear;

        $schoolYear = SchoolYear::where('year', $schoolYearStr)->first();
        $targetSchoolYearId = $schoolYear?->school_year_id;

        $latestEnrollments = DB::table('enrollments as e1')
            ->select('e1.id', 'e1.enrollment_id')
            ->when($targetSchoolYearId, function ($query) use ($targetSchoolYearId) {
                $query->where('e1.school_year_id', $targetSchoolYearId);
            })
            ->whereRaw('e1.registration_date = (
                SELECT MAX(e2.registration_date)
                FROM enrollments AS e2
                WHERE e2.id = e1.id
                ' . ($targetSchoolYearId ? 'AND e2.school_year_id = e1.school_year_id' : '') . '
            )');

        return DB::table('students')
            ->select([
                'students.id',
                'students.student_id',
                'students.first_name',
                'students.middle_name',
                'students.last_name',
                'students.card_number',
                DB::raw("TRIM(CONCAT_WS(' ', students.first_name, students.middle_name, students.last_name)) AS full_name"),
                'classes.grade',
                'sections.name as section_name',
                'residence_halls.type as residence_type',
                'parents.father_phone',
                'parents.mother_phone',
            ])
            ->joinSub($latestEnrollments, 'latest_enrollments', function ($join) {
                $join->on('latest_enrollments.id', '=', 'students.id');
            })
            ->join('enrollments', 'enrollments.enrollment_id', '=', 'latest_enrollments.enrollment_id')
            ->leftJoin('classes', 'classes.class_id', '=', 'enrollments.class_id')
            ->leftJoin('sections', 'sections.section_id', '=', 'enrollments.section_id')
            ->leftJoin('residence_halls', 'residence_halls.residence_id', '=', 'enrollments.residence_id')
            ->leftJoin('parents', 'parents.enrollment_id', '=', 'enrollments.enrollment_id')
            ->where('students.active', 'YES')
            ->where('enrollments.status', 'Active')
            ->get();
    }

    private function resolveLatestParentContacts(int $studentId): array
    {
        $now = Carbon::now(config('app.timezone'));
        $currentMonth = $now->month;
        $currentYear = $now->year;
        $schoolYearStr = ($currentMonth >= 7)
            ? $currentYear . '/' . ($currentYear + 1)
            : ($currentYear - 1) . '/' . $currentYear;

        $schoolYear = SchoolYear::where('year', $schoolYearStr)->first();
        $targetSchoolYearId = $schoolYear?->school_year_id;

        $latestEnrollment = DB::table('enrollments as e1')
            ->select('e1.enrollment_id')
            ->where('e1.id', $studentId)
            ->when($targetSchoolYearId, function ($query) use ($targetSchoolYearId) {
                $query->where('e1.school_year_id', $targetSchoolYearId);
            })
            ->whereRaw('e1.registration_date = (
                SELECT MAX(e2.registration_date)
                FROM enrollments AS e2
                WHERE e2.id = e1.id
                ' . ($targetSchoolYearId ? 'AND e2.school_year_id = e1.school_year_id' : '') . '
            )')
            ->first();

        if (!$latestEnrollment) {
            return [];
        }

        $parent = DB::table('parents')
            ->where('enrollment_id', $latestEnrollment->enrollment_id)
            ->first();

        if (!$parent) {
            return [];
        }

        return array_filter([
            $parent->father_phone ?? null,
            $parent->mother_phone ?? null,
        ]);
    }

    private function syncAttendanceAcrossSessions(GateSession $session, GateAttendance $sourceAttendance): void
    {
        $sessions = GateSession::whereDate('session_date', $session->session_date)
            ->where('gate_session_id', '!=', $session->gate_session_id)
            ->get();

        foreach ($sessions as $otherSession) {
            $attendance = GateAttendance::firstOrNew([
                'gate_session_id' => $otherSession->gate_session_id,
                'student_id' => $sourceAttendance->student_id,
            ]);

            // Always refresh profile data from source attendance
            $attendance->student_name = $sourceAttendance->student_name;
            $attendance->student_grade = $sourceAttendance->student_grade;
            $attendance->student_section = $sourceAttendance->student_section;
            $attendance->residency_status = $sourceAttendance->residency_status;
            $attendance->card_number = $sourceAttendance->card_number;

            if (!$attendance->exists) {
                $attendance->entry_status = 'Not Present';
                $attendance->exit_status = 'Not Checked Out';
            }

            if ($sourceAttendance->check_in_at && !$attendance->check_in_at) {
                $attendance->check_in_at = $sourceAttendance->check_in_at;
                $attendance->entry_status = $sourceAttendance->entry_status;
                $attendance->entry_gate_id = $sourceAttendance->entry_gate_id;
                $attendance->last_scan_type = $sourceAttendance->last_scan_type;
            }

            if ($sourceAttendance->check_out_at && !$attendance->check_out_at) {
                $attendance->check_out_at = $sourceAttendance->check_out_at;
                $attendance->exit_status = $sourceAttendance->exit_status;
                $attendance->exit_gate_id = $sourceAttendance->exit_gate_id;
                $attendance->last_scan_type = $sourceAttendance->last_scan_type;
            }

            $attendance->save();
        }
    }

    private function generateNextGateName(): string
    {
        $index = GatePoint::count() + 1;

        while (true) {
            $candidate = 'Gate ' . $this->numberToLetters($index);
            $exists = GatePoint::whereRaw('LOWER(name) = ?', [strtolower($candidate)])->exists();

            if (!$exists) {
                return $candidate;
            }

            $index++;
        }
    }

    private function numberToLetters(int $number): string
    {
        $letters = '';

        while ($number > 0) {
            $number--;
            $letters = chr(65 + ($number % 26)) . $letters;
            $number = intdiv($number, 26);
        }

        return $letters;
    }

    private function resolveResidencyStatus(?string $rawType): string
    {
        $normalized = strtolower(trim($rawType ?? ''));

        return match ($normalized) {
            'boys dormitory' => 'Boys Dormitory',
            'girls dormitory' => 'Girls Dormitory',
            default => 'Non Residence',
        };
    }
}
