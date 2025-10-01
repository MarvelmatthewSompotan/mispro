<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTokenIdle
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->user()?->currentAccessToken();

        if ($token && $token->last_used_at) {
            if (now()->diffInMinutes($token->last_used_at) > 5) {
                $token->delete();
                return response()->json([
                    'success' => false,
                    'message' => 'Session expired due to inactivity, please login again.'
                ], 401);
            }
        }
        
        return $next($request);
    }
}
