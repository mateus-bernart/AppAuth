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
  Route::get('/user/{id}', [UserController::class, 'getUser']);
  Route::get('/users', [UserController::class, 'getAllUsers']);
  Route::put('/user/{id}', [UserController::class, 'update']);
  Route::post('/logout', [AuthController::class, 'logout']);
  Route::post('/user/{id}/upload-image', [UserController::class, 'uploadImage']);
  Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
  })->middleware(['auth', 'throttle:6,1'])->name('verification.send');
  Route::delete('/user/{id}/remove-image/', [UserController::class, 'removeUserImage']);
  Route::delete('/user/delete/{id}', [UserController::class, 'deleteUser']);

  // ============ BRANCH ===========
  Route::get('/branches', [BranchController::class, 'getAllBranches']);
  Route::get('/branch/{branchId}/stocks', [BranchController::class, 'getBranchWithStock']);

  // ============ PRODUCT ===========
  Route::get('/branch/{branchId}/stocks/products', [ProductController::class, 'getBranchStockProducts']);
  Route::get('/products/check-code/{productId}', [ProductController::class, 'checkCode']);
  Route::get('/product/{productId}', [ProductController::class, 'getProduct']);
  Route::post('/branch/{branchId}/product/create', [ProductController::class, 'createProduct']);
  Route::post('/product/{productId}/add-image', [ProductController::class, 'addImage']);
  Route::delete('/product/delete/{id}', [ProductController::class, 'deleteProduct']);
  Route::delete('/product/{productId}/remove-image', [ProductController::class, 'removeImage']);

  // ============ STOCK ===========
  Route::post('/stock/{productId}/log-adjustment', [StockController::class, 'logAdjustment']);
  Route::post('/stock/{productId}/log-add', [StockController::class, 'logAdd']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/email/send-otp', [EmailVerificationController::class, 'sendOtp']);
Route::post('/email/verify-otp', [EmailVerificationController::class, 'verifyOtp']);
Route::post('/user/send-recover-password', [EmailVerificationController::class, 'sendRecoverPassword']);
Route::post('/user/confirm-recover-password', [EmailVerificationController::class, 'confirmRecoverPassword']);
Route::post('/user/check-otp-timeout', [EmailVerificationController::class, 'checkOtpTimeout']);
