import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import usePermission from '@/Hooks/usePermission';

const MySwal = withReactContent(Swal);

export default function RiwayatIndex({ auth, transaksi, providers, jenis_produk, filters }) {
    const { can } = usePermission();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);

    const [filterProvider, setFilterProvider] = useState(filters?.provider_id || '');
    const [filterJenis, setFilterJenis] = useState(filters?.jenis || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '50');

    const handleFilter = () => {
        router.get(route('riwayat.index'), {
            provider_id: filterProvider,
            jenis: filterJenis,
            start_date: startDate,
            end_date: endDate,
            per_page: perPage
        }, { preserveState: true });
    };

    const handleResetFilter = () => {
        setFilterProvider('');
        setFilterJenis('');
        setStartDate('');
        setEndDate('');
        setPerPage('50');
        router.get(route('riwayat.index'), {}, { preserveState: true });
    };

    // --- HELPER: Format Rupiah ---
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // --- HELPER: Format Tanggal ---
    const formatDate = (dateString) => {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const openDetailModal = (trx) => {
        setSelectedTrx(trx);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTrx(null);
    };

    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Hapus Transaksi?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('transaksi.destroy', id), {
                    onSuccess: () => {
                        MySwal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Transaksi berhasil dihapus', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Transaksi" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">

                        <div className="flex flex-col justify-between gap-4 p-4 mb-6 text-white rounded-lg shadow-md sm:flex-row sm:items-center bg-gradient-to-r from-blue-800 to-blue-500">
                            <h3 className="text-lg font-bold">Riwayat Transaksi</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Tampilkan:</span>
                                <select
                                    className="py-2 pl-3 pr-8 text-sm text-gray-900 bg-white border-none rounded-md shadow-inner focus:ring-blue-300 focus:border-blue-300"
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(e.target.value);
                                        router.get(route('riwayat.index'), {
                                            provider_id: filterProvider,
                                            jenis: filterJenis,
                                            start_date: startDate,
                                            end_date: endDate,
                                            per_page: e.target.value
                                        }, { preserveState: true });
                                    }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>

                        {/* FILTER TRANSAKSI */}
                        <div className="flex flex-col flex-wrap gap-4 p-4 mb-6 border border-gray-200 rounded-lg md:flex-row bg-gray-50">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Filter Provider</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={filterProvider}
                                    onChange={(e) => setFilterProvider(e.target.value)}
                                >
                                    <option value="">-- Semua Provider --</option>
                                    {providers && providers.map(p => (
                                        <option key={p.id} value={p.id}>{p.nama_provider}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block mb-1 text-xs font-bold tracking-wider text-gray-700 uppercase">Filter Jenis Produk</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={filterJenis}
                                    onChange={(e) => setFilterJenis(e.target.value)}
                                >
                                    <option value="">-- Semua Jenis --</option>
                                    {jenis_produk && jenis_produk.map((j, i) => (
                                        <option key={i} value={j}>{j}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block mb-1 text-xs font-bold tracking-wider text-gray-700 uppercase">Dari Tanggal</label>
                                <input
                                    type="date"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block mb-1 text-xs font-bold tracking-wider text-gray-700 uppercase">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end space-x-2 w-full md:w-auto">
                                <button
                                    onClick={handleFilter}
                                    className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition"
                                >
                                    Terapkan Filter
                                </button>
                                <button
                                    onClick={handleResetFilter}
                                    className="px-4 py-2 text-sm font-bold bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 transition"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* TABEL TRANSAKSI UTAMA */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">No Nota</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Kasir</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Total Belanja</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-green-600 uppercase">Laba</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transaksi.data.length > 0 ? (
                                        transaksi.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.no_nota}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {item.user ? item.user.name : 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-right text-gray-900">
                                                    {formatRupiah(item.total_harga)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-right text-green-600">
                                                    +{formatRupiah(item.total_laba)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    {parseFloat(item.kembalian) < 0 ? (
                                                        <span className="px-2 py-1 text-xs font-bold text-red-700 bg-red-100 rounded-full">Hutang</span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-bold text-green-700 bg-green-100 rounded-full">Lunas</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 space-x-3 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => openDetailModal(item)}
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                                                    >
                                                        Lihat Detail
                                                    </button>
                                                    {can('delete history') && (
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-sm font-medium text-red-600 hover:text-red-900"
                                                        >
                                                            Hapus
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500">Belum ada transaksi.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="flex justify-center mt-6">
                            {transaksi.links && transaksi.links.length > 3 && transaksi.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 border mx-1 text-sm rounded-md ${
                                        link.active
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DETAIL TRANSAKSI */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-6">
                    {selectedTrx && (
                        <>
                            <div className="flex items-start justify-between pb-4 mb-4 border-b">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Detail Transaksi</h2>
                                    <p className="text-sm text-gray-500">{selectedTrx.no_nota}</p>
                                    <p className="text-xs text-gray-400">{formatDate(selectedTrx.created_at)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Kasir</p>
                                    <p className="text-sm font-semibold">{selectedTrx.user?.name}</p>
                                </div>
                            </div>

                            <div className="overflow-y-auto max-h-60">
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-2 py-2 text-left">Produk</th>
                                            <th className="px-2 py-2 text-center">Qty</th>
                                            <th className="px-2 py-2 text-right">Harga</th>
                                            <th className="px-2 py-2 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {selectedTrx.details.map((detail) => (
                                            <tr key={detail.id}>
                                                <td className="px-2 py-2">
                                                    <div className="font-medium text-gray-800">
                                                        {detail.produk ? detail.produk.nama_produk : <span className="italic text-red-500">Produk Terhapus</span>}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 text-center">{detail.qty}</td>
                                                <td className="px-2 py-2 text-right text-gray-500">{formatRupiah(detail.harga_jual)}</td>
                                                <td className="px-2 py-2 font-semibold text-right">{formatRupiah(detail.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pt-4 mt-4 space-y-2 text-sm border-t">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Belanja</span>
                                    <span className="text-lg font-bold">{formatRupiah(selectedTrx.total_harga)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tunai</span>
                                    <span>{formatRupiah(selectedTrx.bayar)}</span>
                                </div>
                                {parseFloat(selectedTrx.kembalian) >= 0 && (
                                    <div className="flex justify-between font-semibold text-blue-600">
                                        <span>Kembalian</span>
                                        <span>{formatRupiah(selectedTrx.kembalian)}</span>
                                    </div>
                                )}
                                {parseFloat(selectedTrx.kembalian) < 0 && (
                                    <div className="flex justify-between font-bold text-red-600">
                                        <span>Sisa Hutang</span>
                                        <span>{formatRupiah(Math.abs(selectedTrx.kembalian))}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
                                {/* Tombol Print (Kiri) */}
                                <a
                                    href={route('transaksi.print', selectedTrx.id)}
                                    target="_blank" // Buka di tab baru
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase transition duration-150 ease-in-out bg-gray-800 border border-transparent rounded-md hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Cetak Struk
                                </a>

                                {/* Tombol Tutup (Kanan) */}
                                <SecondaryButton onClick={closeModal}>Tutup</SecondaryButton>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
