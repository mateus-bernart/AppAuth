<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct(private User $user) {}

    public function getAll()
    {
        $users = User::select('id', 'name', 'email')->get();
        return $users;
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if ($user) {
            $result = $user->delete();
            if ($result) {
                return ['message' => 'User was deleted'];
            } else {
                return ['message' => 'User wasn\'t deleted'];
            }
        } else {
            return ['message' => "User not found"];
        }
    }

    public function getUser($id)
    {
        $user = User::where('id', $id)->get();
        return ['user' => $user];
    }

    public function update(Request $request)
    {
        $authUser = Auth::user();

        try {
            $request->validate([
                'file' => 'image|mimes:jpeg,png,jpg|max:2048',
            ]);

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('profile_images', $filename, 'public');

                $authUser->update(['image' => $filename]);

                return response()->json([
                    'message' => 'Image uploaded successfully',
                    'imagePath' => asset('storage/profile_images/' . $path),
                ], 200);
            }

            return response()->json(['message' => 'No image uploaded'], 400);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage(), 'code' => $th->getCode()], 422);
        }
    }
}
