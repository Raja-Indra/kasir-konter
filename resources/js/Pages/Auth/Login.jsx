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
        <div className="flex items-center justify-center w-full min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
            <Head title="Log in" />

            <div className="flex flex-col w-full max-w-6xl overflow-hidden bg-white shadow-2xl dark:bg-gray-800 rounded-3xl lg:flex-row">
                <div className="relative flex flex-col justify-center w-full px-8 py-10 lg:w-1/2 lg:px-20 lg:py-12 xl:px-24 xl:py-16">

                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl dark:text-white">
                            Selamat Datang Kembali!
                        </h2>
                        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                            Masuk untuk melanjutkan aktivitas manajemen konter Anda.
                        </p>
                    </div>

                    {status && (
                        <div className="p-4 mb-6 text-sm font-medium text-green-700 border border-green-200 rounded-lg bg-green-50">
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
                                className="block w-full px-4 py-3 mt-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
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
                                className="block w-full px-4 py-3 mt-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
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
                                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-600 select-none ms-2 dark:text-gray-400">
                                    Ingat saya
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
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

                    <p className="mt-8 text-sm text-center text-gray-500">
                        Belum punya akun? <span className="font-semibold text-indigo-600 cursor-pointer">Hubungi Admin</span>
                    </p>
                </div>

                {/* --- SISI KANAN: AREA VISUAL --- */}
                <div className="relative items-center justify-center hidden w-1/2 overflow-hidden bg-gray-900 lg:flex">
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
