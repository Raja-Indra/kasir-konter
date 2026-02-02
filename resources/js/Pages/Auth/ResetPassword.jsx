import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        // 1. CONTAINER LUAR
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Head title="Reset Password" />

            {/* 2. CARD UTAMA */}
            <div className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col lg:flex-row">
                
                {/* --- SISI KIRI: AREA FORM --- */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-10 lg:px-20 lg:py-12 xl:px-24 xl:py-16 relative">

                    <div className="mb-8">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Buat Password Baru
                        </h2>
                        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                            Pastikan password baru Anda kuat dan mudah diingat.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Input Email (Readonly agar user yakin ini akun yang benar) */}
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" className="text-base" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-2 block w-full px-4 py-3 rounded-xl border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={true} // Biasanya email dilock saat reset
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Input Password Baru */}
                        <div>
                            <InputLabel htmlFor="password" value="Password Baru" className="text-base" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-2 block w-full px-4 py-3 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="new-password"
                                isFocused={true}
                                placeholder="Minimal 8 karakter"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Input Konfirmasi Password */}
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" className="text-base" />
                            <TextInput
                                type="password"
                                id="password_confirmation"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-2 block w-full px-4 py-3 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="new-password"
                                placeholder="Ulangi password baru"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        {/* Tombol Reset */}
                        <div className="pt-4">
                            <PrimaryButton 
                                className="w-full justify-center py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5" 
                                disabled={processing}
                            >
                                Simpan Password Baru
                            </PrimaryButton>
                        </div>
                    </form>
                </div>

                {/* --- SISI KANAN: AREA VISUAL --- */}
                <div className="hidden lg:flex w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
                    {/* Gambar Background */}
                    <img 
                        src="/img/lupapassword.jpg" 
                        alt="Reset Password Background" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>

                    {/* Konten Text */}
                    <div className="relative z-10 p-16 text-white text-center">
                        <div className="mb-6 flex justify-center">
                             {/* Icon Centang/Setup */}
                            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-4xl font-extrabold mb-4 leading-tight">
                            Akun Aman
                        </h3>
                        <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
                            Pembaruan keamanan selesai. Anda akan segera dialihkan kembali ke dashboard untuk mengelola bisnis Anda.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}