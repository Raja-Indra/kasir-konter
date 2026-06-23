import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function DashboardKasir({ auth, stats, recent_transactions }) {
    // Format Rupiah Helper
    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    // Format Waktu Helper
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col items-start justify-between mb-6 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Halo, {auth.user.name}</h2>
                            <p className="text-sm text-gray-500">Selamat bekerja, semoga harimu lancar!</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                            <Link href={route('transaksi.index')} className="px-5 py-3 text-sm font-semibold text-white transition bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                                Buka Kasir
                            </Link>
                            <Link href={route('hutang.index')} className="px-5 py-3 text-sm font-semibold text-red-700 transition bg-red-100 rounded-lg hover:bg-red-200">
                                Catat Bon
                            </Link>
                        </div>
                    </div>

                    {/* --- KARTU STATISTIK KASIR --- */}
                    <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
                        {/* Omzet Kasir Hari Ini */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Omzet Anda Hari Ini</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-blue-600">{formatRupiah(stats.omzet_hari_ini)}</h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-blue-500 rounded-full bg-blue-50 w-fit">
                                💰 Total Uang Masuk
                            </div>
                        </div>

                        {/* Transaksi Kasir Hari Ini */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Transaksi Anda Hari Ini</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-gray-900">{stats.transaksi_hari_ini} <span className="text-sm font-medium text-gray-400">Nota</span></h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-green-500 rounded-full bg-green-50 w-fit">
                                🧾 Aktivitas Hari Ini
                            </div>
                        </div>
                    </div>

                    {/* --- TRANSAKSI TERAKHIR ANDA --- */}
                    <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">🧾 5 Transaksi Terakhir Anda</h3>
                            <Link href={route('riwayat.index')} className="text-sm font-medium text-blue-600 hover:underline">Riwayat Penjualan</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Waktu</th>
                                        <th className="px-4 py-3">Nota</th>
                                        <th className="px-4 py-3 text-right rounded-r-lg">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent_transactions.length > 0 ? (
                                        recent_transactions.map((trx, index) => (
                                            <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-500">{formatTime(trx.created_at)}</td>
                                                <td className="px-4 py-3 font-semibold text-gray-800">{trx.no_nota}</td>
                                                <td className="px-4 py-3 font-bold text-right text-green-600">{formatRupiah(trx.total_harga)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-4 text-center text-gray-400">Belum ada transaksi hari ini.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
