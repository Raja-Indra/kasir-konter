import { usePage } from '@inertiajs/react';

export default function usePermission() {
    const { auth } = usePage().props;

    const can = (permissionName) => {
        // Cek apakah array permissions ada isinya
        if (!auth.permissions) return false;
        return auth.permissions.includes(permissionName);
    };

    const hasRole = (roleName) => {
        // Cek apakah array roles ada isinya
        if (!auth.roles) return false;
        return auth.roles.includes(roleName);
    };

    return { can, hasRole };
}
