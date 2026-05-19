import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Registrasi ChartJS
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard({ auth, stats, chart, demografi_umur, top_produk, low_stock, low_balance, recent_transactions, current_filter }) {

    // Format Rupiah Helper
    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    // Format Waktu Helper
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    // Handler Filter Grafik
    const handleFilterChange = (e) => {
        router.get(route('dashboard'), { filter: e.target.value }, { preserveState: true, preserveScroll: true });
    };

    const getFilterLabel = () => {
        switch(current_filter) {
            case 'hari_ini': return 'Hari Ini (24 Jam)';
            case 'minggu_ini': return '7 Hari Terakhir';
            case 'bulan_ini': return 'Bulan Ini (Per Minggu)';
            case 'tahun_ini': return '1 Tahun Terakhir';
            case '5_tahun': return '5 Tahun Terakhir';
            default: return 'Omzet';
        }
    };

    // Konfigurasi Chart
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => 'Omzet: ' + formatRupiah(context.raw)
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                border: { dash: [4, 4] },

                // Grid Horizontal (Tetap ada, warna abu-abu tipis)
                grid: {
                    color: '#e5e7eb', // Warna grid lebih terlihat dikit
                    display: true
                },

                ticks: {
                    callback: (value) => {
                        if (value >= 1000000) return (value / 1000000).toLocaleString('id-ID') + ' Jt';
                        if (value >= 1000) return (value / 1000).toLocaleString('id-ID') + ' Rb';
                        return value;
                    }
                }
            },
            x: {
                // Grid Vertikal (Ubah display: false menjadi true)
                grid: {
                    display: true, // <--- UBAH INI (Tampilkan Grid)
                    color: '#f3f4f6' // Warna grid vertikal (biar tidak terlalu ramai, buat tipis)
                }
            }
        }
    };

    const chartDataConfig = {
        labels: chart.labels,
        datasets: [
            {
                fill: true,
                label: 'Omzet',
                data: chart.data,
                borderColor: 'rgb(37, 99, 235)', // Warna Blue 600
                backgroundColor: 'rgba(37, 99, 235, 0.1)', // Warna Blue transparan
                tension: 0.4, // Garis melengkung halus
            },
        ],
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">

                    <div className="flex flex-col items-start justify-between mb-6 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Halo, {auth.user.name} 👋</h2>
                            <p className="text-sm text-gray-500">Inilah performa usaha Anda hari ini.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                            <Link href={route('transaksi.index')} className="px-4 py-2 text-sm font-semibold text-white transition bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                                🛒 Buka Kasir
                            </Link>
                            <Link href={route('produk.index')} className="px-4 py-2 text-sm font-semibold text-blue-700 transition bg-blue-100 rounded-lg hover:bg-blue-200">
                                📦 Tambah Produk
                            </Link>
                        </div>
                    </div>

                    {/* --- KARTU STATISTIK --- */}
                    <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-5">
                        {/* Omzet */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Omzet Hari Ini</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-gray-900">{formatRupiah(stats.omzet_hari_ini)}</h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-green-500 rounded-full bg-green-50 w-fit">
                                💰 Penjualan Kotor
                            </div>
                        </div>

                        {/* Laba Bersih */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Laba Bersih Hari Ini</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-green-600">+{formatRupiah(stats.laba_bersih_hari_ini)}</h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-blue-500 rounded-full bg-blue-50 w-fit">
                                🚀 Laba (Tunai)
                            </div>
                        </div>

                        {/* Laba Hutang */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Laba Hutang Hari Ini</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-orange-500">{formatRupiah(stats.laba_hutang_hari_ini)}</h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-orange-600 rounded-full bg-orange-50 w-fit">
                                ⏳ Tertahan
                            </div>
                        </div>

                        {/* Transaksi Count */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Jumlah Transaksi Hari Ini</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-gray-900">{stats.transaksi_hari_ini} <span className="text-sm font-medium text-gray-400">Nota</span></h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-blue-500 rounded-full bg-blue-50 w-fit">
                                🧾 Aktivitas Kasir
                            </div>
                        </div>

                        {/* Total Hutang Pelanggan */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Total Piutang</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-red-500">{formatRupiah(stats.total_sisa_hutang)}</h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-red-500 rounded-full bg-red-50 w-fit">
                                📒 Uang di Luar
                            </div>
                        </div>
                    </div>

                    {/* --- GRAFIK & TOP PRODUK --- */}
                    <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">

                        {/* Grafik Area (2/3 layar) */}
                        <div className="p-6 bg-white border border-gray-100 shadow-sm lg:col-span-2 rounded-xl">
                            <div className="flex flex-col items-start justify-between mb-4 sm:flex-row sm:items-center">
                                <h3 className="text-lg font-bold text-gray-800">Grafik Omzet {getFilterLabel()}</h3>
                                <select 
                                    className="mt-2 sm:mt-0 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                                    value={current_filter || 'minggu_ini'}
                                    onChange={handleFilterChange}
                                >
                                    <option value="hari_ini">Hari Ini</option>
                                    <option value="minggu_ini">Minggu Ini (7 Hari)</option>
                                    <option value="bulan_ini">Bulan Ini</option>
                                    <option value="tahun_ini">1 Tahun Terakhir</option>
                                    <option value="5_tahun">5 Tahun Terakhir</option>
                                </select>
                            </div>

                            {/* UBAH DI SINI: h-64 jadi h-80, tambah relative w-full */}
                            <div className="relative w-full h-80">
                                <Line options={chartOptions} data={chartDataConfig} />
                            </div>
                        </div>

                        {/* Top Produk (1/3 layar) */}
                        <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <h3 className="mb-4 text-lg font-bold text-gray-800">🏆 Produk Terlaris (Bulan Ini)</h3>
                            <div className="space-y-4">
                                {top_produk.length > 0 ? (
                                    top_produk.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between pb-2 border-b border-gray-50 last:border-0">
                                            <div className="flex items-center">
                                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-[250px] md:max-w-[300px]">
                                                        {item.produk ? item.produk.nama_produk : 'Produk Dihapus'}
                                                        {item.produk?.is_flexible_price && (item.produk?.min_nominal || item.produk?.max_nominal) && (
                                                            <span className="font-normal text-xs text-gray-500 ml-1">
                                                                Rp. {item.produk?.min_nominal ? parseFloat(item.produk.min_nominal).toLocaleString('id-ID') : '0'} - Rp. {item.produk?.max_nominal ? parseFloat(item.produk.max_nominal).toLocaleString('id-ID') : '∞'}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {item.produk?.is_digital ? 'Digital' : 'Fisik'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-sm font-bold text-blue-600">{item.total_qty}</span>
                                                <span className="text-[10px] text-gray-400">Terjual</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-sm text-center text-gray-400">Belum ada data penjualan bulan ini.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* --- GRAFIK DEMOGRAFI UMUR --- */}
                    <div className="mb-8 p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">📊 Demografi Umur Pelanggan</h3>
                                <p className="text-sm text-gray-500">Distribusi usia pelanggan berdasarkan transaksi keseluruhan.</p>
                            </div>
                        </div>
                        <div className="relative w-full h-80">
                            <Bar options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { 
                                    legend: { display: false },
                                    tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleFont: { size: 13 },
                                        bodyFont: { size: 13 },
                                        padding: 10,
                                        cornerRadius: 8,
                                        displayColors: false,
                                    }
                                },
                                scales: { 
                                    y: { 
                                        beginAtZero: true, 
                                        ticks: { stepSize: 1 },
                                        grid: { color: '#e5e7eb', display: true },
                                        border: { dash: [4, 4] }
                                    },
                                    x: {
                                        grid: { display: false }
                                    }
                                }
                            }} data={{
                                labels: demografi_umur?.labels || [],
                                datasets: [{
                                    label: 'Jumlah Pelanggan',
                                    data: demografi_umur?.data || [],
                                    backgroundColor: 'rgba(37, 99, 235, 0.85)',
                                    borderColor: 'rgb(37, 99, 235)',
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    barPercentage: 0.5,
                                }]
                            }} />
                        </div>
                    </div>

                    {/* --- ALERTS & RECENT TRANSACTIONS --- */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        
                        {/* Transaksi Terakhir (2/3 layar) */}
                        <div className="p-6 bg-white border border-gray-100 shadow-sm lg:col-span-2 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800">🧾 Transaksi Hari Ini</h3>
                                <Link href={route('riwayat.index')} className="text-sm font-medium text-blue-600 hover:underline">Lihat Semua</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Waktu</th>
                                            <th className="px-4 py-3">Nota</th>
                                            <th className="px-4 py-3">Kasir</th>
                                            <th className="px-4 py-3 text-right rounded-r-lg">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_transactions.length > 0 ? (
                                            recent_transactions.map((trx, index) => (
                                                <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-500">{formatTime(trx.created_at)}</td>
                                                    <td className="px-4 py-3 font-semibold text-gray-800">{trx.no_nota}</td>
                                                    <td className="px-4 py-3 text-gray-500">{trx.user?.name || '-'}</td>
                                                    <td className="px-4 py-3 font-bold text-right text-green-600">{formatRupiah(trx.total_harga)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-4 text-center text-gray-400">Belum ada transaksi hari ini.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Alerts (1/3 layar) */}
                        <div className="space-y-6">
                            {/* Peringatan Saldo */}
                            <div className="p-6 bg-white border border-red-100 shadow-sm rounded-xl">
                                <h3 className="flex items-center mb-4 text-lg font-bold text-gray-800">
                                    <span className="mr-2 text-xl">⚠️</span> Saldo Provider Menipis
                                </h3>
                                <div className="space-y-3">
                                    {low_balance.length > 0 ? (
                                        low_balance.map((provider, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                                                <div>
                                                    <p className="text-sm font-semibold text-red-800">{provider.nama_provider}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-red-600">{formatRupiah(provider.saldo)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-center text-green-700 bg-green-50 rounded-lg">
                                            Semua saldo provider aman 👍
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Peringatan Stok Fisik */}
                            <div className="p-6 bg-white border border-orange-100 shadow-sm rounded-xl">
                                <h3 className="flex items-center mb-4 text-lg font-bold text-gray-800">
                                    <span className="mr-2 text-xl">📦</span> Stok Barang Tipis
                                </h3>
                                <div className="space-y-3">
                                    {low_stock.length > 0 ? (
                                        low_stock.map((product, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                                                <div>
                                                    <p className="text-sm font-semibold text-orange-900 truncate w-44">{product.nama_produk}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-orange-700">{product.stok} sisa</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-center text-green-700 bg-green-50 rounded-lg">
                                            Stok barang fisik aman 👍
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
