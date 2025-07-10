<?php

use App\Http\Controllers\ApplicationFormController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Registration Form
Route::post('/application-forms', [ApplicationFormController::class, 'store']);

?>