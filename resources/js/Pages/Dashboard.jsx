import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrasi ChartJS
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard({ auth, stats, chart, top_produk }) {

    // Format Rupiah Helper
    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    // Konfigurasi Chart
    // Konfigurasi Chart
    // Konfigurasi Chart
    // Konfigurasi Chart
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => formatRupiah(context.raw)
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
                borderColor: 'rgb(79, 70, 229)', // Warna Indigo
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4, // Garis melengkung halus
            },
        ],
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Halo, {auth.user.name} 👋</h2>
                        <p className="text-sm text-gray-500">Inilah performa usaha Anda hari ini.</p>
                    </div>

                    {/* --- KARTU STATISTIK --- */}
                    <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
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

                        {/* Laba */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Laba Bersih Hari Ini</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-green-600">+{formatRupiah(stats.laba_hari_ini)}</h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-indigo-500 rounded-full bg-indigo-50 w-fit">
                                🚀 Keuntungan
                            </div>
                        </div>

                        {/* Transaksi Count */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Jumlah Transaksi</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-gray-900">{stats.transaksi_hari_ini} <span className="text-sm font-medium text-gray-400">Nota</span></h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-blue-500 rounded-full bg-blue-50 w-fit">
                                🧾 Aktivitas Kasir
                            </div>
                        </div>

                        {/* Total Hutang Pelanggan */}
                        <div className="flex flex-col justify-between h-32 p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <div>
                                <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Total Piutang (Bon)</p>
                                <h3 className="mt-1 text-2xl font-extrabold text-red-500">{formatRupiah(stats.total_sisa_hutang)}</h3>
                            </div>
                            <div className="px-2 py-1 text-xs font-bold text-red-500 rounded-full bg-red-50 w-fit">
                                📒 Uang di Luar
                            </div>
                        </div>
                    </div>

                    {/* --- GRAFIK & TOP PRODUK --- */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                        {/* Grafik Area (2/3 layar) */}
                        {/* Grafik Area (2/3 layar) */}
                        <div className="p-6 bg-white border border-gray-100 shadow-sm lg:col-span-2 rounded-xl">
                            <h3 className="mb-4 text-lg font-bold text-gray-800">Grafik Omzet 7 Hari Terakhir</h3>

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
                                                    <p className="w-32 text-sm font-semibold text-gray-800 truncate md:w-40">
                                                        {item.produk ? item.produk.nama_produk : 'Produk Dihapus'}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {item.produk?.is_digital ? 'Digital' : 'Fisik'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-sm font-bold text-indigo-600">{item.total_qty}</span>
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
