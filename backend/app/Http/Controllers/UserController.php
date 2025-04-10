<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserUpdateRequest;
use App\Models\Branch;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct(private User $user) {}

    public function getAllUsers(Request $request)
    {
        $term = $request->query('q');
        if ($term) {
            return
                User::where('name', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%")
                ->get();
        }

        return User::all();
    }

    public function getAllBranches(Request $request)
    {
        $term = $request->query('q');
        if ($term) {
            return
                Branch::where('code', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->get();
        }

        return Branch::all();
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
        return User::find($id);
    }

    public function getBranch($id)
    {
        $branch = Branch::find($id);

        return response()->json(['branch' => $branch]);
    }

    public function uploadImage(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if (!$request->hasFile('file')) {
            return response()->json(['message' => 'No image uploaded'], 400);
        }

        $request->validate([
            'file' => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $file = $request->file('file');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs('profile_images', $filename, 'public');

        $user->image = $filename;
        $user->save();

        return response()->json([
            'message' => 'Image uploaded successfully',
            'imagePath' => asset('storage/profile_images/' . $filename),
            'userUpdated' => $user
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $authUser = User::find($id);

        if (!$authUser) {
            return response()->json([
                'error' => 'User not found'
            ], 404);
        }

        $fields = $request->validate([
            'name' => 'max:255',
            'email' => 'max:255',
            'password' => 'confirmed',
            'phone_number' => 'max:255',
            'street' => 'max:255',
            'neighborhood' => 'max:255',
            'street_number' => 'max:255',
            'city' => 'max:255',
        ]);

        try {
            $authUser->update($fields);
            $user = $authUser->refresh();

            return response()->json(['user' => $user], 200);
        } catch (\Throwable $th) {
            return response()->json(['message' => $th->getMessage(), 'code' => $th->getCode()], 422);
        }
    }


    public function removeUserImage($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'error' => 'User not found',
                404
            ]);
        }

        if ($user->image) {
            $imagePath = "profile_images/{$user->image}";
            if (Storage::disk('public')->exists($imagePath)) {
                if (Storage::disk('public')->delete($imagePath)) {
                    $user->image = null;
                    $user->save();

                    return response()->json([
                        'message' => 'Image deleted successfully.'
                    ],  200);
                } else {
                    return response()->json([
                        'message' => 'Image does not exist.'
                    ], 404);
                }
            } else {
                return response()->json([
                    'message' => 'Image could not be deleted.'
                ], 500);
            }
        }
        return response()->json([
            'message' => 'User does not have an image.'
        ], 404);
    }
}
