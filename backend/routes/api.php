<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\RegistrationController;

Route::post('/registration/start', [RegistrationController::class, 'startRegistration']);
Route::get('/registration/context', [RegistrationController::class, 'getRegistrationContext']);
Route::delete('/registration/context', [RegistrationController::class, 'clearRegistrationContext']);
Route::post('/registration/submit', [RegistrationController::class, 'store']);
Route::get('/registration/preview/{applicationId}', [RegistrationController::class, 'showPreview']);

// Route::get('/students', [RegistrationController::class, 'index']);

// Route::get('/students/{id}', [RegistrationController::class, 'show']);

// Route::get('/students/{id}/history', [RegistrationController::class, 'history']);

Route::get('/registration-option', [MasterDataController::class, 'getRegistrationOption']);
?>