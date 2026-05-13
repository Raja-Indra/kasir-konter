<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (App\Models\User::all() as $user) {
    echo "User: {$user->name} (Role: " . implode(', ', $user->getRoleNames()->toArray()) . ")\n";
}
