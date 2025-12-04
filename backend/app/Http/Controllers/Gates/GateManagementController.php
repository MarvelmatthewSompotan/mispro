<?php

namespace App\Http\Controllers\Gates;

use App\Http\Controllers\Controller;
use App\Models\Gate\GateAttendance;
use App\Models\Gate\GatePoint;
use App\Models\Gate\GateSession;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Exception;

class GateManagementController extends Controller
{
    public function indexGatePoints(): JsonResponse
    {
        $points = GatePoint::orderBy('name')->get();

        return response()->json([
            'data' => $points,
        ]);
    }

    public function storeGatePoint(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:gate_points,name',
            'type' => ['required', Rule::in(['Main', 'Bus', 'Dorm'])],
            'direction' => ['required', Rule::in(['Entry', 'Exit', 'Both'])],
        ]);

        $point = GatePoint::create($data);

        return response()->json([
            'message' => 'Gate point created.',
            'data' => $point,
        ], 201);
    }

    public function updateGatePoint(Request $request, $id): JsonResponse
    {
        $point = GatePoint::findOrFail($id);

        $data = $request->validate([
            'name' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('gate_points', 'name')->ignore($point->gate_point_id, 'gate_point_id'),
            ],
            'type' => ['nullable', Rule::in(['Main', 'Bus', 'Dorm'])],
            'direction' => ['nullable', Rule::in(['Entry', 'Exit', 'Both'])],
        ]);

        $point->update($data);

        return response()->json([
            'message' => 'Gate point updated.',
            'data' => $point,
        ]);
    }

    public function destroyGatePoint($id)
    {
        try {
            $point = GatePoint::findOrFail($id);
            $point->delete();

            return response()->json([
                'succes' => true,
                'message' => 'Gate point deleted.',
            ],200);
        } catch(Exception $e){
            return response()->json([
                'succes' => false,
                'message' => 'Faild to delate gate points.',
                'error' => $e->getMessage(),
            ],500);
        }
    }

    public function startSession(Request $request): JsonResponse
    {
        $data = $request->validate([
            'session_date' => 'nullable|date',
            'entry_threshold' => 'nullable|date_format:H:i',
            'exit_threshold' => 'nullable|date_format:H:i',
        ]);

        $sessionDate = $data['session_date'] ?? Carbon::now()->toDateString();

        $running = GateSession::where('session_date', $sessionDate)
            ->where('status', 'Ongoing')
            ->first();

        if ($running) {
            return response()->json([
                'message' => 'There is already an active session for this date.',
            ], 422);
        }


        $session = GateSession::create([
            'session_date' => $sessionDate,
            'start_at' => Carbon::now(),
            'status' => 'Ongoing',
            'entry_threshold' => $data['entry_threshold'] ?? null,
            'exit_threshold' => $data['exit_threshold'] ?? null,
            'created_by' => optional($request->user())->user_id,
        ]);

        return response()->json([
            'message' => 'Gate session started.',
            'data' => $session,
        ], 201);
    }

    public function endSession($sessionId): JsonResponse
    {
        $session = GateSession::findOrFail($sessionId);

        if ($session->status === 'ended') {
            return response()->json([
                'message' => 'Session already ended.',
            ], 422);
        }

        $session->update([
            'status' => 'Ended',
            'end_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Gate session ended.',
            'data' => $session,
        ]);
    }

    public function updateThresholds(Request $request, $sessionId): JsonResponse
    {
        $session = GateSession::findOrFail($sessionId);

        $data = $request->validate([
            'entry_threshold' => 'nullable|date_format:H:i',
            'exit_threshold' => 'nullable|date_format:H:i',
        ]);

        $session->update($data);

        return response()->json([
            'message' => 'Thresholds updated.',
            'data' => $session,
        ]);
    }

    public function currentSession(): JsonResponse
    {
        $session = GateSession::where('status', 'Ongoing')
            ->orderByDesc('session_date')
            ->first();

        return response()->json([
            'data' => $session,
            'message' => $session ? null : 'No active session.',
        ]);
    }

    public function currentAttendances(Request $request)
    {
        $session = GateSession::where('status', 'ongoing')
            ->orderByDesc('session_date')
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'No active session.',
                'data' => [],
            ], 422);
        }

        $query = GateAttendance::where('gate_session_id', $session->gate_session_id);

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

        return response()->json($attendances);
    }

    public function pastSessions(Request $request): JsonResponse
    {
        $query = GateSession::query();

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

    public function sessionDetail($sessionId): JsonResponse
    {
        $session = GateSession::with('attendances')->findOrFail($sessionId);

        return response()->json([
            'data' => $session,
        ]);
    }

    public function sessionAttendances($sessionId, Request $request): JsonResponse
    {
        $session = GateSession::findOrFail($sessionId);

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
                    WHEN 'Elementary' THEN 2
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
}
