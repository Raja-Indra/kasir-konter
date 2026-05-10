<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

config(['database.connections.mysql.port' => 3307]); // force port 3307

$permissions = Spatie\Permission\Models\Permission::with('roles')->get();
echo "Found " . $permissions->count() . " permissions.\n";
