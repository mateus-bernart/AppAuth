<?php

use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
  // ============ USER ===========
  Route::get('/user', function (Request $request) {
    return $request->user();
  });
  Route::get('/users', [UserController::class, 'getAllUsers']);
  Route::get('/users/{id}', [UserController::class, 'getUser']);
  Route::put('/users/{id}', [UserController::class, 'update']);
  Route::post('/logout', [AuthController::class, 'logout']);
  Route::post('/users/{id}/upload-image', [UserController::class, 'uploadImage']);
  Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
  })->middleware(['auth', 'throttle:6,1'])->name('verification.send');
  Route::delete('/users/{id}/remove-image/', [UserController::class, 'removeUserImage']);
  Route::delete('/users/{id}/delete', [UserController::class, 'deleteUser']);

  // ============ PRODUCT ===========
  Route::get('/products/{id}/check-code', [ProductController::class, 'checkCode']);
  Route::get('/product/{id}', [ProductController::class, 'getProduct']);
  Route::post('/branches/{branchId}/products/{productId?}', [ProductController::class, 'createOrUpdateProduct']);
  Route::post('/product/{id}/add-image', [ProductController::class, 'addImage']);
  Route::delete('/product/{id}/delete', [ProductController::class, 'deleteProduct']);
  Route::delete('/product/{id}/remove-image', [ProductController::class, 'removeImage']);

  // ============ STOCK ===========
  Route::get('/branches/{id}/stocks', [StockController::class, 'getStockByBranchId']);
  Route::get('/products/{id}/stocks', [StockController::class, 'getStockByProductId']);
  Route::post('/stocks/{id}/log-adjustment', [StockController::class, 'logAdjustment']);
  Route::post('/stocks/{id}/log-add', [StockController::class, 'logAdd']);
});

// ============ BRANCH ===========
Route::get('/branches', [BranchController::class, 'getBranches']);

// ============ AUTH ===========
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/email/send-otp', [EmailVerificationController::class, 'sendOtp']);
Route::post('/email/verify-otp', [EmailVerificationController::class, 'verifyOtp']);
Route::post('/user/send-recover-password', [EmailVerificationController::class, 'sendRecoverPassword']);
Route::post('/user/confirm-recover-password', [EmailVerificationController::class, 'confirmRecoverPassword']);
Route::post('/user/check-otp-timeout', [EmailVerificationController::class, 'checkOtpTimeout']);
