<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        api: __DIR__.'/../routes/api.php',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append([
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \App\Http\Middleware\CorsMiddleware::class, // Custom CORS
            \Illuminate\Http\Middleware\HandleCors::class, // Laravel CORS
            \Illuminate\Session\Middleware\StartSession::class, // session
            \Illuminate\Cookie\Middleware\EncryptCookies::class, // Cookie
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class, // Cookie
            \Illuminate\View\Middleware\ShareErrorsFromSession::class, // Flash data
        ]);

        // CSRF protection
        $middleware->alias([
            'csrf' => \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
