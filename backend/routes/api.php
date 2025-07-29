<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\RegistrationController;

// Route::get('/students', [RegistrationController::class, 'index']);

// Route::get('/students/{id}', [RegistrationController::class, 'show']);

// Route::get('/students/{id}/history', [RegistrationController::class, 'history']);

Route::get('/registration-option', [MasterDataController::class, 'getRegistrationOption']);
Route::prefix('students')->group(function () {
  Route::get('/search', [StudentController::class, 'searchStudents']);
  Route::get('/{student_id}/latest-application', [StudentController::class, 'getLatestApplication']);
});

?>