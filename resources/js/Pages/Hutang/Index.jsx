import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function HutangIndex({ auth, hutangs }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedHutang, setSelectedHutang] = useState(null);

    // State Form Create
    const { data, setData, post, processing, reset, errors } = useForm({
        nama_pelanggan: '',
        no_hp: '',
        total_hutang: '',
        keterangan: '',
        jatuh_tempo: ''
    });

    // Helper Rupiah
    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    // Helper Tanggal
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Helper Waktu
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('hutang.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                MySwal.fire('Berhasil', 'Data kasbon tersimpan', 'success');
            }
        });
    };

    // LOGIC BAYAR CICILAN
    const handleBayar = async (hutang) => {
        const { value: formValues } = await MySwal.fire({
            title: `Bayar Cicilan: ${hutang.nama_pelanggan}`,
            html: `
                <div class="text-left text-sm mb-4">
                    <p>Sisa Hutang: <b>${formatRupiah(hutang.sisa)}</b></p>
                </div>
                <input id="swal-nominal" type="number" class="swal2-input" placeholder="Nominal Bayar">
                <input id="swal-catatan" class="swal2-input" placeholder="Catatan (Opsional)">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Bayar',
            preConfirm: () => {
                return [
                    document.getElementById('swal-nominal').value,
                    document.getElementById('swal-catatan').value
                ]
            }
        });

        if (formValues) {
            const nominal = parseFloat(formValues[0]);
            const catatan = formValues[1];

            if (!nominal || nominal <= 0) return MySwal.fire('Error', 'Nominal tidak valid', 'error');
            if (nominal > hutang.sisa) return MySwal.fire('Error', 'Nominal melebihi sisa hutang', 'error');

            router.post(route('hutang.cicil', hutang.id), { nominal, catatan }, {
                onSuccess: () => MySwal.fire('Lunas!', 'Pembayaran diterima', 'success')
            });
        }
    };

    const handleDetail = (hutang) => {
        setSelectedHutang(hutang);
        setIsDetailModalOpen(true);
    };

    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Hapus Data?', text: "Data hutang ini akan hilang permanen.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya, Hapus'
        }).then((result) => {
            if (result.isConfirmed) router.delete(route('hutang.destroy', id));
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Buku Kasbon" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">

                        <div className="flex items-center justify-between p-4 mb-6 text-white rounded-lg shadow-md bg-gradient-to-r from-blue-800 to-blue-500">
                            <h3 className="text-lg font-bold">Buku Kasbon / Piutang</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full text-sm divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Tanggal</th>
                                        <th className="px-4 py-3 text-left">Pelanggan</th>
                                        <th className="px-4 py-3 text-right">Total Hutang</th>
                                        <th className="px-4 py-3 text-right">Terbayar</th>
                                        <th className="px-4 py-3 text-right">Sisa</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {hutangs.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-800">{item.nama_pelanggan}</div>
                                                <div className="text-xs text-gray-500 max-w-[200px] truncate" title={item.keterangan}>{item.keterangan || '-'}</div>
                                                {item.no_hp && (
                                                    <a href={`https://wa.me/${item.no_hp}`} target="_blank" className="text-xs text-green-600 hover:underline">
                                                        📞 {item.no_hp}
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-right">{formatRupiah(item.total_hutang)}</td>
                                            <td className="px-4 py-3 text-right text-green-600">
                                                {formatRupiah(item.terbayar)}
                                                {/* Progress Bar Mini */}
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(item.terbayar / item.total_hutang) * 100}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-right text-red-600">{formatRupiah(item.sisa)}</td>
                                            <td className="px-4 py-3 text-center">
                                                {item.status === 'lunas' ? (
                                                    <span className="px-2 py-1 text-xs font-bold text-green-800 bg-green-100 rounded-full">LUNAS</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-bold text-red-800 bg-red-100 rounded-full">BELUM LUNAS</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 space-x-2 text-center whitespace-nowrap">
                                                <button onClick={() => handleDetail(item)} className="px-3 py-1 text-xs text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
                                                    Detail
                                                </button>
                                                {item.status !== 'lunas' && (
                                                    <button onClick={() => handleBayar(item)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">
                                                        Bayar
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {hutangs.data.length === 0 && (
                                        <tr><td colSpan="7" className="py-6 text-center text-gray-400">Tidak ada data hutang.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links (Optional, jika data banyak) */}
                        <div className="mt-4">
                           {/* Render pagination links here if needed */}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CREATE */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <form onSubmit={handleCreate} className="p-6">
                    <h2 className="mb-4 text-lg font-bold">Catat Kasbon Baru</h2>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Nama Pelanggan" />
                            <TextInput className="w-full mt-1" value={data.nama_pelanggan} onChange={e => setData('nama_pelanggan', e.target.value)} required />
                        </div>
                        <div>
                            <InputLabel value="Nominal Hutang (Rp)" />
                            <TextInput type="number" className="w-full mt-1" value={data.total_hutang} onChange={e => setData('total_hutang', e.target.value)} required />
                        </div>
                        <div>
                            <InputLabel value="Keterangan (Opsional)" />
                            <TextInput className="w-full mt-1" placeholder="Contoh: Pulsa + Rokok" value={data.keterangan} onChange={e => setData('keterangan', e.target.value)} />
                        </div>
                        <div>
                            <InputLabel value="No HP / WA (Opsional)" />
                            <TextInput className="w-full mt-1" placeholder="08..." value={data.no_hp} onChange={e => setData('no_hp', e.target.value)} />
                        </div>
                         <div>
                            <InputLabel value="Jatuh Tempo (Opsional)" />
                            <TextInput type="date" className="w-full mt-1" value={data.jatuh_tempo} onChange={e => setData('jatuh_tempo', e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={() => setIsCreateModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton className="ml-3" disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL DETAIL */}
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="2xl">
                {selectedHutang && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                            <h2 className="text-xl font-bold">Detail Kasbon: {selectedHutang.nama_pelanggan}</h2>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                ✖
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Informasi Hutang</p>
                                <p className="text-sm mb-1"><span className="font-semibold text-gray-700">Tanggal:</span> {formatDate(selectedHutang.created_at)}</p>
                                <p className="text-sm mb-1"><span className="font-semibold text-gray-700">Total:</span> <span className="font-bold">{formatRupiah(selectedHutang.total_hutang)}</span></p>
                                <p className="text-sm mb-1"><span className="font-semibold text-gray-700">Terbayar:</span> <span className="text-green-600 font-bold">{formatRupiah(selectedHutang.terbayar)}</span></p>
                                <p className="text-sm"><span className="font-semibold text-gray-700">Sisa:</span> <span className="text-red-600 font-bold">{formatRupiah(selectedHutang.sisa)}</span></p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Keterangan Tambahan</p>
                                <p className="text-sm mb-1"><span className="font-semibold text-gray-700">No. HP:</span> {selectedHutang.no_hp || '-'}</p>
                                <p className="text-sm mb-1"><span className="font-semibold text-gray-700">Status:</span> {selectedHutang.status === 'lunas' ? <span className="text-green-600 font-bold">LUNAS</span> : <span className="text-red-600 font-bold">BELUM LUNAS</span>}</p>
                                <p className="text-sm mt-2 font-semibold text-gray-700">Keterangan/Produk:</p>
                                <p className="text-sm text-gray-600">{selectedHutang.keterangan || '-'}</p>
                            </div>
                        </div>

                        <h3 className="text-md font-bold mb-3">Riwayat Cicilan / Pembayaran</h3>
                        {selectedHutang.cicilan && selectedHutang.cicilan.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-2">Waktu</th>
                                            <th className="px-4 py-2">Nominal</th>
                                            <th className="px-4 py-2">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {selectedHutang.cicilan.map((cicil, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{formatDateTime(cicil.created_at)}</td>
                                                <td className="px-4 py-2 font-semibold text-green-600">{formatRupiah(cicil.nominal_bayar)}</td>
                                                <td className="px-4 py-2 text-gray-600">{cicil.catatan || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg text-center">
                                <p className="text-sm text-orange-600">Belum ada riwayat pembayaran/cicilan.</p>
                            </div>
                        )}
                        
                        <div className="mt-6 text-right">
                            <SecondaryButton onClick={() => setIsDetailModalOpen(false)}>Tutup</SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
