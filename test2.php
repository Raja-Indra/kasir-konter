<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$perms = app(\Spatie\Permission\PermissionRegistrar::class)->getPermissions();
echo "Size: " . strlen(serialize($perms)) . " bytes\n";
