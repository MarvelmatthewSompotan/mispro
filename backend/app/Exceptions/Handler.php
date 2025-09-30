<?php

namespace App\Exceptions;

use Throwable;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    /**
     * Daftarkan exception handling callbacks untuk aplikasi.
     */
    public function register(): void
    {
        //
    }

    /**
     * Tangani exception Authentication (token tidak valid / expired).
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated.'
        ], 401);
    }
}
