<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegistrationController;

Route::prefix('registration')->group(function () {
    Route::post('/start', [RegistrationController::class, 'startRegistration']);
    Route::get('/context', [RegistrationController::class, 'getRegistrationContext']);
    Route::delete('/context', [RegistrationController::class, 'clearRegistrationContext']);
    Route::post('/submit', [RegistrationController::class, 'store']);
    Route::get('/preview/{applicationId}', [RegistrationController::class, 'showPreview']);
});

Route::get('/csrf-token', function () {
    $token = csrf_token();
    return response()->json([
        'csrf_token' => $token,
    ])->withCookie(cookie('XSRF-TOKEN', $token, 120));
});
