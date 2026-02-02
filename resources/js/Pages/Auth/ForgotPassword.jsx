import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        // 1. CONTAINER LUAR
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Head title="Lupa Password" />

            {/* 2. CARD UTAMA */}
            <div className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col lg:flex-row">
                
                {/* --- SISI KIRI: AREA FORM --- */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-10 lg:px-20 lg:py-12 xl:px-24 xl:py-16 relative">

                    <div className="mb-8">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Lupa Password?
                        </h2>
                        <p className="mt-4 text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                            Jangan khawatir. Masukkan alamat email yang terdaftar, dan kami akan mengirimkan tautan untuk mereset password Anda.
                        </p>
                    </div>

                    {/* Status Message (Jika email berhasil dikirim) */}
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
                                isFocused={true}
                                placeholder="nama@email.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* Tombol Kirim */}
                        <div className="pt-2">
                            <PrimaryButton 
                                className="w-full justify-center py-4 text-base font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5" 
                                disabled={processing}
                            >
                                Kirim Link Reset
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Link Kembali ke Login */}
                    <div className="mt-8 text-center">
                        <Link 
                            href={route('login')} 
                            className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Halaman Login
                        </Link>
                    </div>
                </div>

                {/* --- SISI KANAN: AREA VISUAL --- */}
                <div className="hidden lg:flex w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
                    {/* Gambar Background */}
                    <img 
                        src="\img\lupapassword.jpg"
                        alt="Security Background" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>

                    {/* Konten Text */}
                    <div className="relative z-10 p-16 text-white text-center">
                        <div className="mb-6 flex justify-center">
                            {/* Icon Gembok Besar  */}
                            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-4xl font-extrabold mb-4 leading-tight">
                            Keamanan Akun
                        </h3>
                        <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
                            Kami menjaga keamanan data Anda. Ikuti langkah-langkah di email untuk memulihkan akses ke akun Anda.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}