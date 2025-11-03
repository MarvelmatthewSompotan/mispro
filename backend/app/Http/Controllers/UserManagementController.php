<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Exception;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        try {
            $users = User::select('user_id', 'username', 'full_name', 'email', 'role')
                ->orderBy('created_at', 'desc')
                ->paginate(25);
            
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
        try {
            $validated = $request->validate([
                'username' => 'required|string|max:100',
                'email' => [
                    'required',
                    'email',
                    'unique:users,email',
                    'regex:/^[A-Za-z0-9._%+-]+@mis-mdo\.sch\.id$/'
                ],
                'full_name' => 'required|string|max:255',
                'password' => 'required|min:8',
                'role' => ['required', Rule::in(['admin', 'head_registrar', 'registrar', 'teacher'])],
            ]);

            $user = User::create([
                'username' => $validated['username'],
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'User created successfully',
                'data' => $user,
            ]);
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
        try {
            $user = User::findOrFail($user_id);

            $validated = $request->validate([
                'username' => 'sometimes|string|max:100',
                'email' => [
                    'sometimes', 
                    'email', 
                    Rule::unique('users')->ignore($user->user_id),
                    'regex:/^[A-Za-z0-9._%+-]+@mis-mdo\.sch\.id$/'
                ],
                'full_name' => 'sometimes|string|max:255',
                'password' => 'nullable|min:8',
                'role' => ['sometimes', Rule::in(['admin', 'head_registrar', 'registrar', 'teacher'])],
            ]);

            if (!empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user, 
            ]);
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

            $user->delete();

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
}
