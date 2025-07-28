<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\TestController;

Route::post('/registration/start', [RegistrationController::class, 'startRegistration']);
Route::get('/registration/context', [RegistrationController::class, 'getRegistrationContext']);
Route::delete('/registration/context', [RegistrationController::class, 'clearRegistrationContext']);
Route::post('/registration/submit', [RegistrationController::class, 'store']);
Route::get('/registration/preview/{applicationId}', [RegistrationController::class, 'showPreview']);

// Route::get('/students', [RegistrationController::class, 'index']);

// Route::get('/students/{id}', [RegistrationController::class, 'show']);

// Route::get('/students/{id}/history', [RegistrationController::class, 'history']);

Route::get('/registration-option', [MasterDataController::class, 'getRegistrationOption']);

// Test Routes untuk Postman
Route::prefix('test')->group(function () {
    Route::get('/health', [TestController::class, 'healthCheck']);
    Route::get('/master-data', [TestController::class, 'getAllMasterData']);
    Route::get('/students', [TestController::class, 'getStudents']);
    Route::post('/master-data', [TestController::class, 'addMasterData']);
    Route::post('/academic-data', [TestController::class, 'addAcademicData']);
    Route::post('/school-class', [TestController::class, 'addSchoolClass']);
    Route::delete('/cleanup', [TestController::class, 'cleanupData']);
});
?>