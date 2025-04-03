<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class DeleteAllUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:delete-all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete all users from database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->confirm('Are you sure you want to delete all users?')) {
            User::truncate();
            $this->info("All users deleted successfully");
        }
    }
}
