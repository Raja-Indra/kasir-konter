import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function LaporanIndex({ auth, transaksi, summary, filters }) {

    // State Tanggal
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    // Format Rupiah
    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    // Format Tanggal Indo
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Fungsi Filter
    const handleFilter = () => {
        router.get(route('laporan.index'), { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    // Fungsi Export PDF
    const handleExport = () => {
        // Buka tab baru ke route export dengan parameter tanggal
        const url = route('laporan.export') + `?start_date=${startDate}&end_date=${endDate}`;
        window.open(url, '_blank');
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Laporan Penjualan" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">

                    <div className="flex flex-col items-end justify-between gap-4 mb-6 md:flex-row">
                        <div className="flex items-end w-full gap-4 md:w-auto">
                            <div>
                                <InputLabel value="Dari Tanggal" className="mb-1"/>
                                <TextInput type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full"/>
                            </div>
                            <div>
                                <InputLabel value="Sampai Tanggal" className="mb-1"/>
                                <TextInput type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full"/>
                            </div>
                            <PrimaryButton onClick={handleFilter} className="h-[42px]">Filter</PrimaryButton>
                        </div>

                        <button
                            onClick={handleExport}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center h-[42px]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export PDF
                        </button>
                    </div>

                    {/* --- SUMMARY CARDS --- */}
                    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
                        <div className="p-4 bg-white border border-gray-100 rounded-lg shadow">
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Omzet</p>
                            <p className="text-2xl font-bold text-gray-800">{formatRupiah(summary.total_omzet)}</p>
                        </div>
                        <div className="p-4 bg-white border border-gray-100 rounded-lg shadow">
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Laba Bersih</p>
                            <p className="text-2xl font-bold text-green-600">{formatRupiah(summary.total_laba_bersih)}</p>
                        </div>
                        <div className="p-4 bg-white border border-gray-100 rounded-lg shadow">
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Laba Hutang</p>
                            <p className="text-2xl font-bold text-orange-500">{formatRupiah(summary.total_laba_hutang)}</p>
                        </div>
                        <div className="p-4 bg-white border border-gray-100 rounded-lg shadow">
                            <p className="text-xs font-bold text-gray-500 uppercase">Jumlah Transaksi</p>
                            <p className="text-2xl font-bold text-blue-600">{summary.total_transaksi} Nota</p>
                        </div>
                    </div>

                    {/* --- TABEL DATA --- */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">No Nota</th>
                                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Kasir</th>
                                        <th className="px-6 py-3 text-xs font-medium text-right text-gray-500 uppercase">Total</th>
                                        <th className="px-6 py-3 text-xs font-medium text-right text-green-600 uppercase">Laba</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transaksi.length > 0 ? (
                                        transaksi.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {formatDate(item.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                    {item.no_nota}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {item.user?.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-right text-gray-900 whitespace-nowrap">
                                                    {formatRupiah(item.total_harga)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-right text-green-600 whitespace-nowrap">
                                                    {formatRupiah(item.total_laba)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                                Tidak ada data transaksi pada periode ini.
                                            </td>
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
