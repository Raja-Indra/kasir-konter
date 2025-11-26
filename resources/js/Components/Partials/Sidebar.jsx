import { Link } from '@inertiajs/react';
import logoIndra from '@/Assets/logo-1.png';

export default function Sidebar() {
    return (
        <aside className="hidden w-64 min-h-screen bg-white border-r border-gray-200 md:block">
            <div className="p-6">
                <div className="flex items-center justify-center mb-1 -mt-10">
                    <Link href={route('dashboard')}>
                        <img
                            src={logoIndra}
                            alt="Logo Indra Cell"
                            className="object-contain w-auto h-100"
                            // className="object-contain w-40 h-auto"
                        />
                    </Link>
                </div>

                <h2 className="mb-4 text-xs font-bold tracking-wider text-gray-400 uppercase">Menu Utama</h2>

                <ul className="space-y-2">
                    <li>
                        <Link
                            href={route('dashboard')}
                            className={`block px-4 py-2 rounded hover:bg-indigo-50 text-gray-700 ${route().current('dashboard') ? 'bg-indigo-50 font-bold text-indigo-700' : ''}`}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={route('transaksi.index')}
                            className={`block px-4 py-2 rounded hover:bg-indigo-50 text-gray-700 ${route().current('transaksi.*') ? 'bg-indigo-50 font-bold text-indigo-700' : ''}`}
                        >
                            Kasir
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={route('riwayat.index')}
                            className={`block px-4 py-2 rounded hover:bg-indigo-50 text-gray-700 ${route().current('riwayat.*') ? 'bg-indigo-50 font-bold text-indigo-700' : ''}`}
                        >
                            Riwayat Transaksi
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={route('providers.index')}
                            className={`block px-4 py-2 rounded hover:bg-indigo-50 text-gray-700 ${route().current('providers.*') ? 'bg-indigo-50 font-bold text-indigo-700' : ''}`}
                        >
                            Provider
                        </Link>
                    </li>
                    <li>
                        <Link
                            /* PERBAIKAN DI SINI: Gunakan 'produk.index' (pakai titik) */
                            href={route('produk.index')}

                            /* Agar menu tetap menyala saat di halaman edit/tambah, gunakan 'produk.*' */
                            className={`block px-4 py-2 rounded hover:bg-indigo-50 text-gray-700 ${route().current('produk.*') ? 'bg-indigo-50 font-bold text-indigo-700' : ''}`}
                        >
                            Produk
                        </Link>
                    </li>
                    {/* Tambahkan menu lain di sini */}
                </ul>
            </div>
        </aside>
    );
}
