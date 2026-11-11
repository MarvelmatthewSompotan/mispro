<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifySyncApiKey
{
    /**
     * Protects the server-to-server sync endpoints.
     * The caller must send the shared key in the "X-API-Key" header
     * (or as "Authorization: Bearer <key>").
     *
     * If SYNC_API_KEY is not configured, every request is rejected.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $expected = (string) config('services.sync.api_key');
        $provided = (string) ($request->header('X-API-Key') ?: $request->bearerToken());

        if ($expected === '' || $provided === '' || !hash_equals($expected, $provided)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unauthorized.',
            ], 401);
        }

        return $next($request);
    }
}
