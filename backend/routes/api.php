<?php

use App\Http\Controllers\RegistrationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/registration', [RegistrationController::class, 'store']);

Route::get('/students', [RegistrationController::class, 'index']);

Route::get('/students/{id}', [RegistrationController::class, 'show']);

Route::get('/students/{id}/history', [RegistrationController::class, 'history']);

?>