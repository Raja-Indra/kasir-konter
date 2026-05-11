<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'muhammadindra226@gmail.com')->first();
if ($user) {
    echo "Can view dashboard admin: " . ($user->can('view dashboard admin') ? 'true' : 'false') . PHP_EOL;
    echo "Can view dashboard owner: " . ($user->can('view dashboard owner') ? 'true' : 'false') . PHP_EOL;
    echo "Can view dashboard kasir: " . ($user->can('view dashboard kasir') ? 'true' : 'false') . PHP_EOL;
}
