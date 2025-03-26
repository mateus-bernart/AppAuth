<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
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
}
