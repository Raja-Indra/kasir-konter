<?php
use Spatie\Permission\Models\Role;
$role = Role::where('name', 'admin')->first();
if ($role) {
    $role->update(['name' => 'owner']);
    echo "Role updated.\n";
} else {
    echo "Role admin not found.\n";
}