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
            \Illuminate\Http\Middleware\HandleCors::class, // CORS
            \Illuminate\Session\Middleware\StartSession::class, // session
            \Illuminate\Cookie\Middleware\EncryptCookies::class, // Cookie
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class, // Cookie
            \Illuminate\View\Middleware\ShareErrorsFromSession::class, // Flash data
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class, // CSRF protection
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
