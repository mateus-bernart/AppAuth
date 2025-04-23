<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\MyMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
        $user->otp_expires_at = now()->addMinutes(5); // or addSeconds(300) for 5 min
        $user->save();

        try {
            //TODO: change to user email
            Mail::to('mateus.bernart@coperdia.com.br')->send(new MyMail($user, $otp));
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
            return response()->json(['message' => 'User not found'], 404);
        }

        if (!$user->otp || !$user->otp_expires_at || now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP has expired. Please request a new one'], 400);
        }

        if ($user->otp === $request->otp) {
            $user->email_verified = true;
            $user->email_verified_at = now();
            $user->otp = null;
            $user->otp_expires_at = null;
            $user->save();
            return response()->json(['message' => 'Email verified successfully'], 200);
        }

        return response()->json(['message' => 'Invalid OTP'], 400);
    }

    public function sendRecoverPassword(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found. '], 404);
        }

        //Creat OTP 4 digits
        $otp = rand(1000, 9999);
        $user->otp = $otp;
        $user->otp_expires_at = now()->addMinutes(5); // or addSeconds(300) for 5 min
        $user->save();

        try {
            //TODO: change to user email
            Mail::to('mateus.bernart@coperdia.com.br')->send(new MyMail($user, $otp));
            return response()->json(['message' => 'E-mail sent.', 'email' => $user->email], 200);
        } catch (\Throwable $th) {
            return response()->json($th->getMessage());
        }
    }

    public function confirmRecoverPassword(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $fields = $request->validate([
            'password' => 'required|confirmed',
            'code' => 'required|numeric|digits:4'
        ]);

        try {
            if ($user->otp === $request->code) {
                $user->password = $fields['password'];
                if (Hash::check($fields['password'], $user->password)) {
                    $user->otp = null;
                    $user->otp_expires_at = null;
                    $user->save();
                    return response()->json(['message' => 'Password changed.'], 200);
                } else {
                    return response()->json(['message' => 'Password error'], 400);
                }
            } else {
                return response()->json(['message' => 'Invalid OTP'], 400);
            }

            $user->update($fields);
            $userUpdated = $user->refresh();

            return response()->json(['User updated', 'user' => $userUpdated], 200);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage(), 'code' => $th->getCode()], 422);
        }
    }
    public function checkOtpTimeout(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return ['expires_at' => $user->otp_expires_at];
    }
}
