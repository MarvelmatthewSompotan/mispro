<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\AuditTrailService;

class AuthController extends Controller
{
    protected $auditTrail;

    public function __construct(AuditTrailService $auditTrail)
    {
        $this->auditTrail = $auditTrail;
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // catat attempt gagal login
            $this->auditTrail->log('login_failed', [
                'email' => $request->email,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Email or Password is incorrect'
            ], 401);
        }

        // Set session user
        Auth::login($user);

        // Hapus token lama
        $user->tokens()->delete();

        // Buat token baru
        $newToken = $user->createToken('auth_token');

        // Update last_used_at saat login
        $newToken->accessToken->forceFill([
            'last_used_at' => now(),
        ])->save();

        $token = $newToken->plainTextToken;

        // catat login sukses
        $this->auditTrail->log('login_success', [
            'user_id' => $user->user_id,
            'email'   => $user->email,
            'role'    => $user->role,
        ]);

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'user_id' => $user->user_id,
                'name'    => $user->name,
                'email'   => $user->email,
                'role'    => $user->role
            ]
        ]);
    }

    public function logout(Request $request) 
    {
        $user = $request->user();

        // ambil token yang sedang dipakai
        $token = $request->user()->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        // catat logout
        $this->auditTrail->log('logout_success', [
            'user_id'  => $user->user_id,
            'email'    => $user->email,
            'token_id' => $token->id ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.'
        ]);
    }

    public function me(Request $request) 
    {
        return response()->json($request->user());
    }
}
