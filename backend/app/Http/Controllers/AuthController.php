<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'street_number' => 'max:255',
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed',
            'phone_number' => 'max:255',
            'street' => 'max:255',
            'neighborhood' => 'max:255',
            'city' => 'max:255'
        ]);

        $user = User::create($fields);

        if ($user->wasRecentlyCreated) {
            return ['name' => $user, 'street' => $user->street, 'status' => 'created'];
        } else {
            return ['status' => 'fail'];
        }
    }

    public function login(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|email|exists:users',
            'password' => 'required'
        ]);

        //Auth attempt (mobile & web)
        $authorized = Auth::attempt(['email' => $request->email, 'password' => $request->password]);
        $user = User::where('email', $request->email)->first();

        if ($authorized) {
            $token = $user->createToken($request->email)->plainTextToken;
            return ['token' => $token, 'user' => $user];
        } else {
            return ['message' => 'Incorrect Password'];
        }

        return $user;
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return [
            'message' => 'You are logged out.'
        ];
    }
}
