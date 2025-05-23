<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'street_number' => 'max:255',
            'name' => 'required|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed',
            'phone_number' => 'max:255|min:11|max:255|not_in:0',
            'street' => 'max:255|numeric|nullable',
            'neighborhood' => 'max:255',
            'user_type' => 'max:255|required',
            'user_branch' => 'max:255|required',
            'city' => 'max:255'
        ]);

        $user = User::create($fields);

        if ($user->wasRecentlyCreated) {
            return ['name' => $user, 'street' => $user->street, 'status' => 'created'];
        } else {
            return ['status' => 'fail'];
        }

        event(new Registered($user));
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
            'password' => 'required'
        ]);

        $authorized = Auth::attempt(['email' => $request->email, 'password' => $request->password]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => "User not found"]);
        }

        if (!$authorized) {
            return response()->json(['message' => 'Incorrect Password'], 401);
        }

        if (!$user->email_verified) {
            return response()->json(['message' => 'E-mail not verified yet!', 'email' => $request->email], 403);
        }

        $token = $user->createToken($request->email)->plainTextToken;
        return response()->json(['token' => $token, 'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type,
        ]], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'You are logged out.'
        ], 200);
    }
}
