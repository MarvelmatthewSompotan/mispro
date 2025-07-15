<?php

use App\Http\Controllers\RegistrationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Registration Form
Route::post('/application-forms', [RegistrationController::class, 'store']);

?>