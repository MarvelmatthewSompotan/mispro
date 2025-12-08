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
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
            ->whereDate('session_date', Carbon::now()->toDateString())
            ->orderByDesc('gate_session_id')
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'No active session.',
                'data' => [],
            ], 422);
        }

        $query = GateAttendance::where('gate_session_id', $session->gate_session_id)
            ->with(['latestScan', 'previousScan']);

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

        $attendances = $query
            ->paginate($request->get('per_page', 25));

        $attendances->getCollection()->transform(function ($attendance) {
            $source = $attendance->previousScan ?: $attendance->latestScan;
            $attendance->last_activity = $source?->scan_type;
            $attendance->last_activity_time = optional($source?->scan_time)->toDateTimeString();
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
        $lastScan = $attendance ? [
            'scan_type' => $latestLog->scan_type,
            'scan_time' => optional($latestLog->scan_time)->toDateTimeString(),
            'student_id' => $attendance->student_id,
            'student_name' => $attendance->student_name,
            'grade' => $attendance->student_grade,
            'section' => $attendance->student_section,
            'residency_status' => $attendance->residency_status,
            'card_number' => $attendance->card_number,
            'entry_status' => $attendance->entry_status,
            'exit_status' => $attendance->exit_status,
            'check_in_at' => optional($attendance->check_in_at)->toDateTimeString(),
            'check_out_at' => optional($attendance->check_out_at)->toDateTimeString(),
        ] : null;

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

        $query = GateAttendance::where('gate_session_id', $session->gate_session_id);

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

        return response()->json($attendances);
    }

    public function exportSession($sessionId): JsonResponse
    {
        $session = GateSession::findOrFail($sessionId);

        $attendances = GateAttendance::where('gate_session_id', $session->gate_session_id)
            ->orderBy('student_name')
            ->get()
            ->values()
            ->map(function ($attendance, $index) {
                return [
                    'no' => $index + 1,
                    'student_id' => $attendance->student_id,
                    'student_name' => $attendance->student_name,
                    'grade' => $attendance->student_grade,
                    'section' => $attendance->student_section,
                    'check_in' => optional($attendance->check_in_at)->format('H:i'),
                    'check_out' => optional($attendance->check_out_at)->format('H:i'),
                    'entry_status' => $attendance->entry_status,
                    'exit_status' => $attendance->exit_status,
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
            ->whereDate('session_date', Carbon::now()->toDateString())
            ->orderByDesc('gate_session_id')
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'No active gate session.',
            ], 422);
        }

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
            }
        }

        $attendance->save();

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
        $contact = $parent->father_phone ?? $parent->mother_phone ?? $student->phone_number;

        GateParentNotification::create([
            'gate_attendance_id' => $attendance->gate_attendance_id,
            'recipient_contact' => $contact,
            'message_type' => $mode === 'check_in' ? 'Check In' : 'Check Out',
            'message_body' => ($mode === 'check_in'
                ? "{$attendance->student_name} checked in at {$attendance->check_in_at?->format('H:i')}"
                : "{$attendance->student_name} checked out at {$attendance->check_out_at?->format('H:i')}"),
            'status' => 'Pending',
        ]);

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
