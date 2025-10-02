<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckTokenLifetime
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user) {
            $token = $user->currentAccessToken();

            if ($token) {
                $lifetimeMinutes = 2; 

                $createdAt = $token->created_at;

                if ($createdAt && now()->diffInMinutes($createdAt) >= $lifetimeMinutes) {
                    $token->delete();

                    return response()->json([
                        'success' => false,
                        'message' => 'Token expired. Please login again.'
                    ], 401);
                }
            }
        }

        return $next($request);
    }
}
