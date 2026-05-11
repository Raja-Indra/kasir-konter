<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$roles = \Spatie\Permission\Models\Role::all();
foreach ($roles as $r) {
    echo "Role ID: " . $r->id . " Name: '" . $r->name . "'" . PHP_EOL;
}
