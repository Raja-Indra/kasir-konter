import { Link } from '@inertiajs/react';
import logoIndra from '@/Assets/logo-1.png';

// Terima props isOpen dan setIsOpen dari Layout
export default function Sidebar({ isOpen, setIsOpen }) {

    // Class dinamis untuk Link
    const baseLinkClass = `flex items-center py-3 rounded transition-all duration-200 hover:bg-indigo-50 text-gray-700 ${isOpen ? 'px-4' : 'justify-center px-2'}`;
    const activeLinkClass = "bg-indigo-50 font-bold text-indigo-700";

    return (
        <aside
            className={`
                bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out relative
                ${isOpen ? 'w-64' : 'w-20'}
                min-h-screen
            `}
        >
            {/* --- TOMBOL TOGGLE (GANTUNGAN KUNCI) --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute z-50 p-1 text-gray-500 bg-white border border-gray-200 rounded-full shadow-md -right-3 top-20 hover:bg-gray-100"
                title={isOpen ? "Kecilkan Sidebar" : "Besarkan Sidebar"}
            >
                {isOpen ? (
                    // Icon Panah Kiri
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                    // Icon Panah Kanan
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                )}
            </button>

            <div className="flex-1 p-4">
                {/* --- LOGO AREA --- */}
                <div className={`flex items-center justify-center mb-6 transition-all duration-300 ${isOpen ? '-mt-4' : 'mt-2'}`}>
                    <Link href={route('dashboard')}>
                        {isOpen ? (
                            // Logo Besar (Saat Terbuka)
                            <img
                                src={logoIndra}
                                alt="Logo"
                                className="object-contain w-auto h-32 transition-all"
                            />
                        ) : (
                            // Logo Kecil / Ikon (Saat Tertutup) - Bisa ganti icon lain atau huruf 'I'
                            <div className="flex items-center justify-center w-10 h-10 text-xl font-bold text-white bg-indigo-600 rounded-lg shadow">
                                I
                            </div>
                        )}
                    </Link>
                </div>

                {/* Judul Menu (Hanya muncul jika terbuka) */}
                <div className={`mb-4 text-xs font-bold tracking-wider text-gray-400 uppercase transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    Menu Utama
                </div>

                <ul className="space-y-2">

                    {/* Dashboard */}
                    <li>
                        <Link href={route('dashboard')} className={`${baseLinkClass} ${route().current('dashboard') ? activeLinkClass : ''}`} title={!isOpen ? "Dashboard" : ""}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Dashboard</span>
                        </Link>
                    </li>

                    {/* Kasir */}
                    <li>
                        <Link href={route('transaksi.index')} className={`${baseLinkClass} ${route().current('transaksi.*') ? activeLinkClass : ''}`} title={!isOpen ? "Kasir" : ""}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Kasir</span>
                        </Link>
                    </li>

                    {/* Riwayat */}
                    <li>
                        <Link href={route('riwayat.index')} className={`${baseLinkClass} ${route().current('riwayat.*') ? activeLinkClass : ''}`} title={!isOpen ? "Riwayat" : ""}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Riwayat</span>
                        </Link>
                    </li>

                    {/* Kasbon */}
                    <li>
                        <Link href={route('hutang.index')} className={`${baseLinkClass} ${route().current('hutang.*') ? activeLinkClass : ''}`} title={!isOpen ? "Kasbon" : ""}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Buku Kasbon</span>
                        </Link>
                    </li>

                    {/* User */}
                    <li>
                        <Link href={route('users.index')} className={`${baseLinkClass} ${route().current('users.*') ? activeLinkClass : ''}`} title={!isOpen ? "User" : ""}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Manajemen User</span>
                        </Link>
                    </li>

                    {/* Provider */}
                    <li>
                        <Link href={route('providers.index')} className={`${baseLinkClass} ${route().current('providers.*') ? activeLinkClass : ''}`} title={!isOpen ? "Provider" : ""}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Provider</span>
                        </Link>
                    </li>

                    {/* Produk */}
                    <li>
                        <Link href={route('produk.index')} className={`${baseLinkClass} ${route().current('produk.*') ? activeLinkClass : ''}`} title={!isOpen ? "Produk" : ""}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 8V3z" />
                            </svg>
                            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Produk</span>
                        </Link>
                    </li>

                </ul>
            </div>
        </aside>
    );
}
