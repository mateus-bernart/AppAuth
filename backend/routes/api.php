<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::middleware('auth:sanctum')->group(function () {
  Route::get('/user', function (Request $request) {
    return $request->user();
  });
  Route::get('/user/{id}', [UserController::class, 'getUser']);
  Route::get('/users', [UserController::class, 'getAll']);
  Route::post('/logout', [AuthController::class, 'logout']);
  Route::put('/user/{id}', [UserController::class, 'update']);
  Route::post('/user/{id}/upload-image', [UserController::class, 'uploadImage']);
  Route::delete('/user/{id}/remove-image/', [UserController::class, 'removeUserImage']);
  Route::delete('/user/delete/{id}', [UserController::class, 'destroy']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
