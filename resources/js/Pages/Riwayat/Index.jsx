import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

export default function RiwayatIndex({ auth, transaksi }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTrx, setSelectedTrx] = useState(null);

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

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Transaksi" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Riwayat Transaksi</h3>
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
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => openDetailModal(item)}
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Lihat Detail
                                                    </button>
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
                        <div className="flex justify-end mt-4">
                            {transaksi.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 border rounded mx-1 text-sm ${
                                        link.active
                                            ? 'bg-indigo-600 text-white border-indigo-600'
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
                                <div className="flex justify-between font-semibold text-indigo-600">
                                    <span>Kembalian</span>
                                    <span>{formatRupiah(selectedTrx.kembalian)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
                                {/* Tombol Print (Kiri) */}
                                <a
                                    href={route('transaksi.print', selectedTrx.id)}
                                    target="_blank" // Buka di tab baru
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase transition duration-150 ease-in-out bg-gray-800 border border-transparent rounded-md hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
