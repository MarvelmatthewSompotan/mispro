<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\User;
use App\Models\Gate\GateAssignment;
use App\Models\Gate\GatePoint;
use App\Services\AuditTrailService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserManagementController extends Controller
{   
    // konstanta yang menandai role mana saja yang wajib punya gate point (Jery)
    private const GATE_ROLES = ['security', 'gate_display'];
    //Jery

    protected $auditTrail;

    public function __construct(AuditTrailService $auditTrail)
    {
        $this->auditTrail = $auditTrail;
    }

    public function index(Request $request)
    {
        try {
            $query = User::select('user_id', 'username', 'full_name', 'email', 'role');

            if ($request->filled('search')) {
                $search = $request->search;

                $query->where(function ($q) use ($search) {
                    if (is_numeric($search)) {
                        $q->orWhere('user_id', $search);
                    }

                    $q->orWhere('username', 'LIKE', "%{$search}%")
                    ->orWhere('full_name', 'LIKE', "%{$search}%");
                });
            }

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->filled('username')) {
                $query->where('username', 'LIKE', '%' . $request->username . '%');
            }

            if ($request->filled('full_name')) {
                $query->where('full_name', 'LIKE', '%' . $request->full_name . '%');
            }

            if ($request->filled('email')) {
                $query->where('email', 'LIKE', '%' . $request->email . '%');
            }

            if ($request->filled('role') && is_array($request->role)) {
                $query->whereIn('role', $request->role);
            }

            $sortable = ['user_id', 'username', 'full_name', 'role'];

            $sortBy = $request->get('sort_by');
            $sortDir = $request->get('sort_dir', 'asc');

            if (in_array($sortBy, $sortable)) {
                $sortDir = strtolower($sortDir) === 'desc' ? 'desc' : 'asc';
                $query->orderBy($sortBy, $sortDir);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $users = $query->paginate(25);

            return response()->json([
                'success' => true,
                'data' => $users,
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $messages = [
            'username.unique' => 'The username (:input) has already been taken. Please choose a different username.',
            'password.min' => 'The password must be at least 8 characters.',
            'email.unique' => 'This email address is already registered. Please use another email.',
            'email.regex' => 'The email format is invalid. It must use the domain @mis-mdo.sch.id.',
            'gate_point_id.exists' => 'Gate point tidak ditemukan.',
        ];

        try {
            $validated = $request->validate([
                'username' => 'required|string|max:100|unique:users,username',
                'email' => [
                    'required',
                    'email',
                    'unique:users,email',
                    'regex:/^[A-Za-z0-9._%+-]+@mis-mdo\.sch\.id$/'
                ],
                'full_name' => 'required|string|max:255',
                'password' => 'required|min:8',
                'role' => ['required', Rule::in(['admin', 'head_registrar', 'registrar', 'teacher', 'security', 'gate_display'])],
                'gate_point_id' => ['nullable', 'integer', 'exists:gate_points,gate_point_id'],
            ], $messages);

            $gatePointId = $validated['gate_point_id'] ?? null;
            $roleValue = $validated['role'];
            $requiresGate = $this->requiresGateRole($roleValue);

            if ($requiresGate) {
                if (!$gatePointId) {
                    throw ValidationException::withMessages([
                        'gate_point_id' => ['Gate point wajib dipilih untuk role ini.'],
                    ]);
                }
                $this->ensureGatePointAvailable($gatePointId, $roleValue);
            } else {
                $gatePointId = null;
            }

            unset($validated['gate_point_id']);

            $user = User::create([
                'username' => $validated['username'],
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);
            
            if ($gatePointId) {
                $this->syncGatePointAssignment($gatePointId, $user, $roleValue);
            } else {
                $this->removeGateAssignments($user);
            }
            $this->auditTrail->log('Create User', [
                'action' => 'Create',
                'user_id' => $user->user_id,
                'username' => $user->username,
                'role' => $user->role,
                'description' => "Created new user: {$user->username} ({$user->role})"
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, $user_id)
    {
        $messages = [
            'username.unique' => 'The username (:input) has already been taken by another user. Please choose a different username.',
            'password.min' => 'The password must be at least 8 characters.',
            'email.unique' => 'This email address is already registered to another user. Please use another email.',
            'email.regex' => 'The email format is invalid. It must use the domain @mis-mdo.sch.id.',
            'gate_point_id.exists' => 'Gate point tidak ditemukan.',
        ];

        try {
            $user = User::findOrFail($user_id);

            $validated = $request->validate([
                'username' => [
                    'sometimes',
                    'string',
                    'max:100',
                    Rule::unique('users', 'username')->ignore($user->user_id, 'user_id'),
                ],
                'email' => [
                    'sometimes', 
                    'email', 
                    Rule::unique('users', 'email')->ignore($user->user_id, 'user_id'),
                    'regex:/^[A-Za-z0-9._%+-]+@mis-mdo\.sch\.id$/'
                ],
                'full_name' => 'sometimes|string|max:255',
                'password' => 'nullable|min:8',
                'role' => ['sometimes', Rule::in(['admin', 'head_registrar', 'registrar', 'teacher', 'security', 'gate_display'])],
                'gate_point_id' => ['nullable', 'integer', 'exists:gate_points,gate_point_id'],
            ], $messages);

            $requestedGatePointId = $validated['gate_point_id'] ?? null;
            unset($validated['gate_point_id']);

            $targetRole = $validated['role'] ?? $user->role;
            $requiresGate = $this->requiresGateRole($targetRole);

            $currentAssignment = GateAssignment::where('user_id', $user->user_id)
                ->where('assignment_type', $targetRole)
                ->first();
            $currentGatePointId = $currentAssignment?->gate_point_id;

            if ($requiresGate) {
                $targetGatePointId = $requestedGatePointId ?? $currentGatePointId;

                if (!$targetGatePointId) {
                    throw ValidationException::withMessages([
                        'gate_point_id' => ['Gate point wajib dipilih untuk role ini.'],
                    ]);
                }

                $this->ensureGatePointAvailable($targetGatePointId, $targetRole, $currentAssignment?->gate_assignment_id);
            } else {
                $targetGatePointId = null;
            }

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            $user->fill($validated);

            if ($user->isDirty()) {
                $changes = $user->getDirty();
                
                if (isset($changes['password'])) {
                    $changes['password'] = '******** (Password Changed)';
                }

                $user->save();

                $this->auditTrail->log('Update User', [
                    'action' => 'Update',
                    'user_id' => $user->user_id,
                    'username' => $user->username,
                    'changes' => $changes,
                    'description' => "Updated user details for {$user->username}"
                ]);
            }

            if ($requiresGate) {
                $this->syncGatePointAssignment($targetGatePointId, $user, $targetRole);
            } else {
                $this->removeGateAssignments($user);
            }

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user, 
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, $user_id)
    {
        try {
            if (auth()->user()->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Authorization failed. Only administrators can delete users.',
                ], 403);
            }

            $user = User::findOrFail($user_id);

            if (auth()->id() === $user->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete your own account.',
                ], 403);
            }

            if ($user->role === 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete another admin.',
                ], 403);
            }

            GateAssignment::where('user_id', $user->user_id)->delete();

            $user->delete();

            $this->auditTrail->log('Delete User', [
                'action' => 'Delete',
                'user_id' => $user->user_id,
                'username' => $user->username,
                'deleted_data' => $user->only(['user_id', 'username', 'full_name', 'role']), // Helper 'only' mirip membuat array manual
                'description' => "Deleted user: {$user->username} ({$user->role})"
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function requiresGateRole(string $role): bool
    {
        return in_array($role, self::GATE_ROLES, true);
    }

    private function ensureGatePointAvailable(int $gatePointId, string $assignmentType, ?int $ignoreAssignmentId = null): void
    {
        $exists = GatePoint::where('gate_point_id', $gatePointId)->exists();

        if (!$exists) {
            throw ValidationException::withMessages([
                'gate_point_id' => ['Gate point tidak ditemukan.'],
            ]);
        }

        $conflict = GateAssignment::where('gate_point_id', $gatePointId)
            ->where('assignment_type', $assignmentType)
            ->when($ignoreAssignmentId, function ($query) use ($ignoreAssignmentId) {
                $query->where('gate_assignment_id', '!=', $ignoreAssignmentId);
            })
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'gate_point_id' => ['Gate point sudah terhubung ke user lain untuk penugasan ini.'],
            ]);
        }
    }

    private function syncGatePointAssignment(int $gatePointId, User $user, string $assignmentType): void
    {
        GateAssignment::updateOrCreate(
            [
                'user_id' => $user->user_id,
                'assignment_type' => $assignmentType,
            ],
            [
                'gate_point_id' => $gatePointId,
            ]
        );

        GateAssignment::where('user_id', $user->user_id)
            ->where('assignment_type', '!=', $assignmentType)
            ->delete();
    }

    private function removeGateAssignments(User $user): void
    {
        GateAssignment::where('user_id', $user->user_id)->delete();
    }
}
