<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifySyncApiKey
{
    /**
     * Headers added by Cloudflare or a reverse proxy. A request that carries any of
     * them came from outside the server, even if the proxy itself runs locally.
     */
    private const PROXY_HEADERS = [
        'X-Forwarded-For',
        'X-Forwarded-Host',
        'X-Forwarded-Proto',
        'X-Forwarded-Port',
        'X-Forwarded-Prefix',
        'X-Real-IP',
        'Forwarded',
        'CF-Connecting-IP',
        'CF-Ray',
        'True-Client-IP',
    ];

    /**
     * Protects the server-to-server sync endpoints.
     *
     * A request is allowed when either:
     *  - it sends the shared key in "X-API-Key" (or "Authorization: Bearer <key>"), or
     *  - SYNC_ALLOW_LOCAL is enabled and the request comes straight from this server
     *    (loopback address, no proxy headers). This is how the Go service on the same
     *    machine calls http://localhost:8000, so it keeps working without a key.
     *
     * Everything that arrives through Cloudflare or the reverse proxy must send the key.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->hasValidKey($request) || $this->isDirectLocalRequest($request)) {
            return $next($request);
        }

        return response()->json([
            'status'  => 'error',
            'message' => 'Unauthorized.',
        ], 401);
    }

    private function hasValidKey(Request $request): bool
    {
        $expected = (string) config('services.sync.api_key');
        $provided = (string) ($request->header('X-API-Key') ?: $request->bearerToken());

        return $expected !== '' && $provided !== '' && hash_equals($expected, $provided);
    }

    private function isDirectLocalRequest(Request $request): bool
    {
        if (!config('services.sync.allow_local')) {
            return false;
        }

        // The raw socket address, not $request->ip(): trusted-proxy handling would
        // otherwise replace it with a value taken from request headers.
        $remote = (string) $request->server('REMOTE_ADDR');

        if (!in_array($remote, ['127.0.0.1', '::1'], true)) {
            return false;
        }

        foreach (self::PROXY_HEADERS as $header) {
            if ($request->headers->has($header)) {
                return false;
            }
        }

        return true;
    }
}
