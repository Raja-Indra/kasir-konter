import { Link } from '@inertiajs/react';
import logoIndra from '@/Assets/logo-1.png';
import usePermission from '@/Hooks/usePermission';
import { usePage } from '@inertiajs/react';

export default function Sidebar({ isOpen, setIsOpen }) {
    const { can } = usePermission();
    const { shop_settings } = usePage().props;

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
            {/* --- TOMBOL TOGGLE --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute z-50 p-1 text-gray-500 bg-white border border-gray-200 rounded-full shadow-md -right-3 top-20 hover:bg-gray-100"
                title={isOpen ? "Kecilkan Sidebar" : "Besarkan Sidebar"}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                )}
            </button>

            <div className="flex-1 p-4">
                {/* --- LOGO AREA DINAMIS --- */}
                <div className={`flex items-center justify-center mb-6 transition-all duration-300 ${isOpen ? '-mt-4' : 'mt-2'}`}>
                    <Link href={route('dashboard')}>
                        {isOpen ? (
                            <img
                                src={shop_settings?.logo_toko ? `/storage/${shop_settings.logo_toko}` : logoIndra}
                                alt="Logo"
                                className="object-contain w-auto h-32 transition-all"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-10 h-10 text-xl font-bold text-white bg-indigo-600 rounded-lg shadow">I</div>
                        )}
                    </Link>
                </div>

                <div className={`mb-4 text-xs font-bold tracking-wider text-gray-400 uppercase transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    Menu Utama
                </div>

                <ul className="space-y-2">

                    {/* Dashboard - Cek izin view dashboard */}
                    {can('view dashboard') && (
                        <li>
                            <Link href={route('dashboard')} className={`${baseLinkClass} ${route().current('dashboard') ? activeLinkClass : ''}`} title={!isOpen ? "Dashboard" : ""}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Dashboard</span>
                            </Link>
                        </li>
                    )}

                    {/* Kasir - Cek izin view transaction */}
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

                    {/* Riwayat - Cek izin view reports (karena riwayat bagian dari laporan) */}
                    {can('view reports') && (
                        <li>
                            <Link href={route('riwayat.index')} className={`${baseLinkClass} ${route().current('riwayat.*') ? activeLinkClass : ''}`} title={!isOpen ? "Riwayat" : ""}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Riwayat</span>
                            </Link>
                        </li>
                    )}

                    {/* Kasbon - Cek izin view debt */}
                    {can('view debt') && (
                        <li>
                            <Link href={route('hutang.index')} className={`${baseLinkClass} ${route().current('hutang.*') ? activeLinkClass : ''}`} title={!isOpen ? "Buku Kasbon" : ""}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Buku Kasbon</span>
                            </Link>
                        </li>
                    )}

                    {/* Laporan Penjualan - Cek izin view reports */}
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

                    {/* Manajemen User - Cek izin view users */}
                    {can('view users') && (
                        <li>
                            <Link href={route('users.index')} className={`${baseLinkClass} ${route().current('users.*') ? activeLinkClass : ''}`} title={!isOpen ? "Manajemen User" : ""}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Manajemen User</span>
                            </Link>
                        </li>
                    )}

                    {/* Provider & Produk - Cek jika bisa lihat produk ATAU lihat provider */}
                    {(can('view products') || can('view providers')) && (
                        <>
                            {can('view providers') && (
                                <li>
                                    <Link href={route('providers.index')} className={`${baseLinkClass} ${route().current('providers.*') ? activeLinkClass : ''}`} title={!isOpen ? "Provider" : ""}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Provider</span>
                                    </Link>
                                </li>
                            )}

                            {can('view products') && (
                                <li>
                                    <Link href={route('produk.index')} className={`${baseLinkClass} ${route().current('produk.*') ? activeLinkClass : ''}`} title={!isOpen ? "Produk" : ""}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 8V3z" />
                                        </svg>
                                        <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Produk</span>
                                    </Link>
                                </li>
                            )}
                        </>
                    )}

                    {/* Roles & Izin - Cek izin manage roles */}
                    {can('manage roles') && (
                        <li>
                            <Link href={route('roles.index')} className={`${baseLinkClass} ${route().current('roles.*') ? activeLinkClass : ''}`} title={!isOpen ? "Roles & Izin" : ""}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Roles & Izin</span>
                            </Link>
                        </li>
                    )}

                    {/* Pengaturan Toko - Cek izin manage settings */}
                    {can('manage settings') && (
                        <li>
                            <Link href={route('settings.index')} className={`${baseLinkClass} ${route().current('settings.*') ? activeLinkClass : ''}`} title={!isOpen ? "Pengaturan Toko" : ""}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-all ${isOpen ? 'mr-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'}`}>Pengaturan Toko</span>
                            </Link>
                        </li>
                    )}

                </ul>
            </div>
        </aside>
    );
}
