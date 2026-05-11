<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = \App\Models\User::with('roles')->get();
foreach ($users as $u) {
    echo $u->email . ' - ' . json_encode($u->roles->pluck('name')) . PHP_EOL;
}
