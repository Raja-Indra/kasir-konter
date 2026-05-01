import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import logoIndra from '@/Assets/logo-1.png';
import usePermission from '@/Hooks/usePermission';

export default function Sidebar({ isOpen, setIsOpen }) {
    const { can } = usePermission();
    const { shop_settings } = usePage().props;

    // State untuk mengatur dropdown mana yang terbuka
    const [activeDropdown, setActiveDropdown] = useState('');

    // Buka dropdown secara otomatis jika URL saat ini ada di dalam kelompok menu tersebut
    useEffect(() => {
        if (route().current('riwayat.*') || route().current('hutang.*')) setActiveDropdown('transaksi');
        if (route().current('providers.*') || route().current('produk.*')) setActiveDropdown('master');
        if (route().current('users.*') || route().current('roles.*') || route().current('settings.*')) setActiveDropdown('konfigurasi');
    }, []);

    // Fungsi untuk toggle dropdown dan otomatis melebarkan sidebar jika sedang tertutup
    const handleDropdownClick = (menuName) => {
        if (!isOpen) setIsOpen(true);
        setActiveDropdown(activeDropdown === menuName ? '' : menuName);
    };

    const baseLinkClass = `flex items-center py-3 rounded transition-all duration-200 hover:bg-blue-700 text-blue-100 ${isOpen ? 'px-4' : 'justify-center px-2'}`;
    const activeLinkClass = "bg-blue-700 font-bold text-white shadow-md";
    const subLinkClass = `block py-2 px-4 rounded transition-all duration-200 hover:bg-blue-700 hover:text-white text-sm text-blue-200`;
    const activeSubLinkClass = "bg-blue-700 font-bold text-white shadow-inner";

    return (
        <aside
            className={`
                bg-gradient-to-b from-blue-800 to-blue-950 text-white hidden md:flex flex-col transition-all duration-300 ease-in-out relative
                ${isOpen ? 'w-64' : 'w-20'}
                min-h-screen shadow-lg z-40
            `}
        >
            {/* --- TOMBOL TOGGLE --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute z-50 p-1 text-blue-600 bg-white border border-blue-200 rounded-full shadow-md -right-3 top-20 hover:bg-blue-50"
                title={isOpen ? "Kecilkan Sidebar" : "Besarkan Sidebar"}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                )}
            </button>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {/* --- LOGO AREA --- */}
                <div className={`flex items-center justify-center mb-6 transition-all duration-300 ${isOpen ? '-mt-4' : 'mt-2'}`}>
                    <Link href={route('dashboard')}>
                        {isOpen ? (
                            <img
                                src={shop_settings?.logo_toko ? `/storage/${shop_settings.logo_toko}` : logoIndra}
                                alt="Logo"
                                className="object-contain w-auto h-32 transition-all brightness-0 invert"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-10 h-10 text-xl font-bold text-white bg-blue-600 rounded-lg shadow">I</div>
                        )}
                    </Link>
                </div>

                <div className={`mb-4 text-xs font-bold tracking-wider text-blue-300 uppercase transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    Menu Utama
                </div>

                <ul className="space-y-2">

                    {/* 1. MENU AKSES CEPAT (Tanpa Dropdown) */}
                    {(can('view dashboard owner') || can('view dashboard kasir')) && (
                        <li>
                            <Link href={route('dashboard')} className={`${baseLinkClass} ${route().current('dashboard') ? activeLinkClass : ''}`} title={!isOpen ? "Dashboard" : ""}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Dashboard</span>
                            </Link>
                        </li>
                    )}

                    {can('view transaction') && (
                        <li>
                            <Link href={route('transaksi.index')} className={`${baseLinkClass} ${route().current('transaksi.*') ? activeLinkClass : ''}`} title={!isOpen ? "Kasir" : ""}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Kasir</span>
                            </Link>
                        </li>
                    )}

                    {/* 2. TRANSAKSI DROPDOWN */}
                    {(can('view reports') || can('view debt')) && (
                        <li>
                            <button onClick={() => handleDropdownClick('transaksi')} className={`${baseLinkClass} w-full justify-between ${activeDropdown === 'transaksi' ? 'bg-blue-900' : ''}`} title={!isOpen ? "Transaksi" : ""}>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Transaksi</span>
                                </div>
                                {isOpen && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'transaksi' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                )}
                            </button>
                            
                            <ul className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${activeDropdown === 'transaksi' && isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                                {can('view reports') && (
                                    <li><Link href={route('riwayat.index')} className={`${subLinkClass} ${route().current('riwayat.*') ? activeSubLinkClass : ''}`}>Riwayat Transaksi</Link></li>
                                )}
                                {can('view debt') && (
                                    <li><Link href={route('hutang.index')} className={`${subLinkClass} ${route().current('hutang.*') ? activeSubLinkClass : ''}`}>Buku Kasbon</Link></li>
                                )}
                            </ul>
                        </li>
                    )}

                    {/* 3. DATA MASTER DROPDOWN */}
                    {(can('view products') || can('view providers')) && (
                        <li>
                            <button onClick={() => handleDropdownClick('master')} className={`${baseLinkClass} w-full justify-between ${activeDropdown === 'master' ? 'bg-blue-900' : ''}`} title={!isOpen ? "Data Master" : ""}>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Data Master</span>
                                </div>
                                {isOpen && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'master' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                )}
                            </button>
                            
                            <ul className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${activeDropdown === 'master' && isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                                {can('view products') && (
                                    <li><Link href={route('produk.index')} className={`${subLinkClass} ${route().current('produk.*') ? activeSubLinkClass : ''}`}>Produk</Link></li>
                                )}
                                {can('view providers') && (
                                    <li><Link href={route('providers.index')} className={`${subLinkClass} ${route().current('providers.*') ? activeSubLinkClass : ''}`}>Provider</Link></li>
                                )}
                            </ul>
                        </li>
                    )}

                    {/* 4. LAPORAN (Tanpa Dropdown karena baru 1, tapi siap dijadikan dropdown nanti) */}
                    {can('view reports') && (
                        <li>
                            <Link href={route('laporan.index')} className={`${baseLinkClass} ${route().current('laporan.*') ? activeLinkClass : ''}`} title={!isOpen ? "Laporan Penjualan" : ""}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Laporan Penjualan</span>
                            </Link>
                        </li>
                    )}

                    {/* 5. KONFIGURASI DROPDOWN (Termasuk Integrasi WA) */}
                    {(can('manage settings') || can('view users') || can('manage roles')) && (
                        <li>
                            <button onClick={() => handleDropdownClick('konfigurasi')} className={`${baseLinkClass} w-full justify-between ${activeDropdown === 'konfigurasi' ? 'bg-blue-900' : ''}`} title={!isOpen ? "Konfigurasi" : ""}>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    </svg>
                                    <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Konfigurasi</span>
                                </div>
                                {isOpen && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'konfigurasi' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                )}
                            </button>
                            
                            <ul className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${activeDropdown === 'konfigurasi' && isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
                                {can('view users') && (
                                    <li><Link href={route('users.index')} className={`${subLinkClass} ${route().current('users.*') ? activeSubLinkClass : ''}`}>Manajemen User</Link></li>
                                )}
                                {can('manage roles') && (
                                    <li><Link href={route('roles.index')} className={`${subLinkClass} ${route().current('roles.*') ? activeSubLinkClass : ''}`}>Roles & Izin</Link></li>
                                )}
                                {can('manage settings') && (
                                    <>
                                        <li><Link href={route('settings.index')} className={`${subLinkClass} ${route().current('settings.index') ? activeSubLinkClass : ''}`}>Profil Toko</Link></li>
                                        {/* Ganti 'settings.wa' dengan route Foonte Anda nanti */}
                                        <li>
                                            <Link href={route('settings.wa')} className={`${subLinkClass} flex justify-between items-center ${route().current('settings.wa') ? activeSubLinkClass : ''}`}>
                                                Integrasi WA
                                                <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded border border-blue-200">Fonnte</span>
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </li>
                    )}

                </ul>
            </div>
        </aside>
    );
}
