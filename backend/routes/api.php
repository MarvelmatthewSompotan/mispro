<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\RegistrationController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum', 'idle')->group(function() {
  Route::post('/logout', [AuthController::class, 'logout']);
  Route::get('/me', [AuthController::class, 'me']);
});

Route::get('/registration-option', [MasterDataController::class, 'getRegistrationOption']);

Route::middleware(['auth:sanctum', 'idle', 'role:admin,registrar'])->group(function () {
  Route::prefix('students')->group(function () {
    Route::get('/', [StudentController::class, 'index']);
    Route::get('/search', [StudentController::class, 'searchStudents']);
    Route::get('/{student_id}/latest-application', [StudentController::class, 'getLatestApplication']);
    Route::post('/{student_id}/update', [StudentController::class, 'updateStudent']);
    Route::get('/{studentId}/history-dates', [StudentController::class, 'getStudentHistoryDates']);
    Route::get('/history/{versionId}', [StudentController::class, 'getHistoryDetail']);
  });
});

Route::middleware(['auth:sanctum', 'idle', 'role:admin,registrar'])->group(function () {
  Route::prefix('registration')->group(function () {
    Route::get('/', [RegistrationController::class, 'index']);
    Route::post('/start', [RegistrationController::class, 'startRegistration']);
    Route::get('/context/{draft_id}', [RegistrationController::class, 'getRegistrationContext']);
    Route::post('/store/{draft_id}', [RegistrationController::class, 'store']);
    Route::get('/preview/{applicationId}/version/{versionId}', [RegistrationController::class, 'showPreview']);
  });
});

?>