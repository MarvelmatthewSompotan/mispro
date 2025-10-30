<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Events\UserLoggedIn;
use Illuminate\Http\Request;
use App\Services\AuditTrailService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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
            'email' => [
                'required',
                'email',
                'regex:/^[A-Za-z0-9._%+-]+@mis-mdo\.sch\.id$/',
            ],
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

        $user->tokens()->delete();

        $newToken = $user->createToken('auth_token');

        $newToken->accessToken->forceFill([
            'last_used_at' => now(),
        ])->save();

        $token = $newToken->plainTextToken;

        $this->auditTrail->log('login_success', [
            'user_id' => $user->user_id,
            'email'   => $user->email,
            'role'    => $user->role,
        ]);

        event(new UserLoggedIn($user));

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'user_id' => $user->user_id,
                'username'    => $user->username,
                'email'   => $user->email,
                'role'    => $user->role
            ]
        ]);
    }

    public function logout(Request $request) 
    {
        $user = $request->user();

        $token = $request->user()->currentAccessToken();

        if ($token) {
            $token->delete();
        }

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
