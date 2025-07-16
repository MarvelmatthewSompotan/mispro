<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\RegistrationController;

Route::post('/registration', [RegistrationController::class, 'store']);

Route::get('/students', [RegistrationController::class, 'index']);

Route::get('/students/{id}', [RegistrationController::class, 'show']);

Route::get('/students/{id}/history', [RegistrationController::class, 'history']);

Route::prefix('master')->group(function () {
  Route::get('/sections', [MasterDataController::class, 'getSections']);
  Route::get('/programs', [MasterDataController::class, 'getPrograms']);
  Route::get('/majors', [MasterDataController::class, 'getMajors']);
  Route::get('/transportations', [MasterDataController::class, 'getTransportations']);
  Route::get('/residences', [MasterDataController::class, 'getResidenceHalls']);
})
?>