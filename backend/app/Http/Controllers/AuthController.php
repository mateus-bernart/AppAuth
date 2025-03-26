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
        //TODO: Helper UserService 
        $fields = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed',
        ]);

        $user = User::create($fields);
        if ($user->wasRecentlyCreated) {
            return ['name' => $user, 'status' => 'created'];
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
            return ['status' => true, 'token' => $token, 'user' => $user];
        } else {
            return ['status' => false, 'messages' => ['password' => ['Incorrect Password']]];
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
