import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Profile" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Header Profile Professional */}
                    <div className="p-6 bg-gradient-to-r from-blue-800 to-blue-500 rounded-lg shadow-md flex items-center justify-between text-white">
                        <div>
                            <h2 className="text-2xl font-bold">Pengaturan Profil</h2>
                            <p className="text-blue-100 text-sm mt-1">Kelola informasi pribadi dan pengaturan keamanan akun Anda.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white shadow-sm sm:rounded-lg border border-gray-100">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="w-full"
                            />
                        </div>

                        <div className="p-6 bg-white shadow-sm sm:rounded-lg border border-gray-100">
                            <UpdatePasswordForm className="w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
