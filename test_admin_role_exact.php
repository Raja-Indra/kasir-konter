<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$role = \Spatie\Permission\Models\Role::where('name', 'Admin')->first();
if ($role) {
    echo json_encode($role->permissions->pluck('name'));
} else {
    echo "Role Admin not found.";
}
