import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Head title="Log in" />

            <div className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col lg:flex-row">
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-10 lg:px-20 lg:py-12 xl:px-24 xl:py-16 relative">
                    
                    <div className="mb-8"> 
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Selamat Datang Kembali!
                        </h2>
                        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                            Masuk untuk melanjutkan aktivitas manajemen konter Anda.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Input Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-base" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full px-4 py-3 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="username"
                                isFocused={true}
                                placeholder="nama@email.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Input Password */}
                        <div>
                            <InputLabel htmlFor="password" value="Password" className="text-base" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full px-4 py-3 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400 select-none">
                                    Ingat saya
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        {/* Tombol Login */}
                        <div className="pt-4">
                            <PrimaryButton 
                                className="w-full justify-center py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5" 
                                disabled={processing}
                            >
                                Masuk ke Dashboard
                            </PrimaryButton>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Belum punya akun? <span className="text-indigo-600 font-semibold cursor-pointer">Hubungi Admin</span>
                    </p>
                </div>

                {/* --- SISI KANAN: AREA VISUAL --- */}
                <div className="hidden lg:flex w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
                    <img 
                        src="/img/login.jpg" 
                        alt="Abstract Login Background" 
                        className="absolute inset-0 w-full h-full opacity-90"
                    />
                </div>

            </div>
        </div>
    );
}