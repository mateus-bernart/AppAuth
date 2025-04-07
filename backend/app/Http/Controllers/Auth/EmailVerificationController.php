<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class EmailVerificationController extends Controller
{
    public function sendOtp(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'user not found']);
        }

        //Creat OTP 4 digits
        $otp = rand(1000, 9999);
        $user->otp = $otp;
        $user->save();

        try {
            Mail::raw("Your CODE (OTP) is: $otp", function ($message) use ($user) {
                $message->to($user->email)->subject("Your Code for Email Verification");
            });
        } catch (\Throwable $th) {
            return response()->json($th->getMessage());
        }

        return response()->json(['message' => 'OTP sent to your email']);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|numeric|digits:4'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 400);
        }

        if ($user->otp === $request->otp) {
            $user->email_verified = true;
            $user->otp = null;
            $user->save();
            return response()->json(['message' => 'Email verified successfully'], 200);
        }

        return response()->json(['message' => 'Invalid OTP'], 400);
    }
}
