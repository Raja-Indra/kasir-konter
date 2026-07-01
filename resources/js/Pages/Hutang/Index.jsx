import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import usePermission from '@/Hooks/usePermission';

const MySwal = withReactContent(Swal);

export default function HutangIndex({ auth, hutangs, filters }) {
    const { can, hasRole } = usePermission();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedHutang, setSelectedHutang] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    // State Form Create
    const { data, setData, post, processing, reset, errors } = useForm({
        nama_pelanggan: '',
        no_hp: '',
        total_hutang: '',
        keterangan: '',
        jatuh_tempo: ''
    });

    const formatInputRupiah = (value) => {
        if (!value && value !== 0) return '';
        const numberString = value.toString().replace(/[^0-9]/g, '');
        if (!numberString) return '';
        return parseInt(numberString, 10).toLocaleString('id-ID');
    };

    const parseInputRupiah = (value) => {
        if (!value && value !== 0) return '';
        return value.toString().replace(/[^0-9]/g, '');
    };

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
        MySwal.fire({
            title: 'Simpan Data?',
            text: 'Yakin ingin mencatat kasbon baru ini?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Simpan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('hutang.store'), {
                    onSuccess: () => {
                        setIsCreateModalOpen(false);
                        reset();
                        MySwal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data kasbon tersimpan', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    }
                });
            }
        });
    };

    // SEARCH LOGIC
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('hutang.index'), { search }, {
                    preserveState: true,
                    replace: true
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    // LOGIC BAYAR CICILAN
    const handleBayar = async (hutang) => {
        const { value: formValues } = await MySwal.fire({
            title: `Bayar Cicilan: ${hutang.nama_pelanggan}`,
            html: `
                <div class="text-left text-sm mb-4">
                    <p>Sisa Hutang: <b>${formatRupiah(hutang.sisa)}</b></p>
                </div>
                <input id="swal-nominal" type="text" inputmode="numeric" class="swal2-input" placeholder="Nominal Bayar" autofocus>
                <input id="swal-catatan" class="swal2-input" placeholder="Catatan (Opsional)">
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Bayar',
            didOpen: () => {
                const nominalInput = document.getElementById('swal-nominal');
                const catatanInput = document.getElementById('swal-catatan');
                
                const handleEnter = (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        MySwal.clickConfirm();
                    }
                };

                const formatSwalInput = (e) => {
                    let val = e.target.value.replace(/[^0-9]/g, '');
                    if(val) e.target.value = parseInt(val, 10).toLocaleString('id-ID');
                    else e.target.value = '';
                };

                if (nominalInput) {
                    nominalInput.addEventListener('input', formatSwalInput);
                    nominalInput.addEventListener('keydown', handleEnter);
                }
                if (catatanInput) catatanInput.addEventListener('keydown', handleEnter);
            },
            preConfirm: () => {
                return [
                    document.getElementById('swal-nominal').value.replace(/[^0-9]/g, ''),
                    document.getElementById('swal-catatan').value
                ]
            }
        });

        if (formValues) {
            const nominal = parseFloat(formValues[0]);
            const catatan = formValues[1];

            if (!nominal || nominal <= 0) return MySwal.fire('Error', 'Nominal tidak valid', 'error');
            if (nominal > hutang.sisa) return MySwal.fire('Error', 'Nominal melebihi sisa hutang', 'error');

            MySwal.fire({
                title: 'Konfirmasi Pembayaran',
                text: `Anda akan mencatat pembayaran sebesar ${formatRupiah(nominal)} untuk ${hutang.nama_pelanggan}. Lanjutkan?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Proses',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.post(route('hutang.cicil', hutang.id), { nominal, catatan }, {
                        onSuccess: () => MySwal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Pembayaran diterima', showConfirmButton: false, timer: 3000, timerProgressBar: true })
                    });
                }
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

                        <div className="flex flex-col justify-between gap-4 p-4 mb-6 text-white rounded-lg shadow-md md:flex-row md:items-center bg-gradient-to-r from-blue-800 to-blue-500">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold">Buku Kasbon / Piutang</h3>
                                {/* <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-700 rounded-full uppercase tracking-wider">
                                    {hutangs.total} Data
                                </span> */}
                            </div>
                            <div className="flex flex-col items-center w-full gap-3 sm:flex-row md:w-auto">
                                {/* Search input placed to the left of the button */}
                                <div className="relative w-full text-gray-900 sm:w-64">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    <TextInput
                                        type="text"
                                        className="block w-full pl-9 pr-3 py-1.5 border-none rounded-md leading-5 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 sm:text-sm shadow-inner"
                                        placeholder="Cari pelanggan..."
                                        value={search}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                                {can('create debt') && (
                                    <PrimaryButton className="!bg-white !text-blue-800 hover:!bg-gray-100 whitespace-nowrap w-full sm:w-auto justify-center" onClick={() => setIsCreateModalOpen(true)}>
                                        + Catat Kasbon
                                    </PrimaryButton>
                                )}
                            </div>
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
                                        <th className="px-4 py-3 text-right">Aksi</th>
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
                                            <td className="px-4 py-3 text-sm font-medium text-right whitespace-nowrap">
                                                <button onClick={() => handleDetail(item)} className="mr-4 text-gray-600 transition hover:text-gray-900">
                                                    Detail
                                                </button>
                                                {item.status !== 'lunas' && can('pay debt') && (
                                                    <button onClick={() => handleBayar(item)} className="mr-4 text-blue-600 transition hover:text-blue-900">
                                                        Bayar
                                                    </button>
                                                )}
                                                {hasRole('owner') && (
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 transition hover:text-red-900">Hapus</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {hutangs.data.length === 0 && (
                                        <tr><td colSpan="7" className="py-6 text-center text-gray-400">Tidak ada data hutang.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links */}
                        {hutangs.links && hutangs.links.length > 3 && (
                            <div className="flex flex-wrap justify-center gap-1 mt-6">
                                {hutangs.links.map((link, key) => (
                                    <Link
                                        key={key}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 text-sm border rounded-md ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
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
                            <TextInput type="text" inputMode="numeric" className="w-full mt-1" placeholder="Contoh: 50.000" value={formatInputRupiah(data.total_hutang)} onChange={e => setData('total_hutang', parseInputRupiah(e.target.value))} required />
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
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="4xl">
                {selectedHutang && (
                    <div className="p-6">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b">
                            <h2 className="text-xl font-bold">Detail Kasbon: {selectedHutang.nama_pelanggan}</h2>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                ✖
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 rounded-lg bg-gray-50">
                                <p className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">Informasi Hutang</p>
                                <p className="mb-1 text-sm"><span className="font-semibold text-gray-700">Tanggal:</span> {formatDate(selectedHutang.created_at)}</p>
                                <p className="mb-1 text-sm"><span className="font-semibold text-gray-700">Total:</span> <span className="font-bold">{formatRupiah(selectedHutang.total_hutang)}</span></p>
                                <p className="mb-1 text-sm"><span className="font-semibold text-gray-700">Terbayar:</span> <span className="font-bold text-green-600">{formatRupiah(selectedHutang.terbayar)}</span></p>
                                <p className="text-sm"><span className="font-semibold text-gray-700">Sisa:</span> <span className="font-bold text-red-600">{formatRupiah(selectedHutang.sisa)}</span></p>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50">
                                <p className="mb-1 text-xs font-bold tracking-wider text-gray-500 uppercase">Keterangan Tambahan</p>
                                <p className="mb-1 text-sm"><span className="font-semibold text-gray-700">No. HP:</span> {selectedHutang.no_hp || '-'}</p>
                                <p className="mb-1 text-sm"><span className="font-semibold text-gray-700">Status:</span> {selectedHutang.status === 'lunas' ? <span className="font-bold text-green-600">LUNAS</span> : <span className="font-bold text-red-600">BELUM LUNAS</span>}</p>
                                <p className="mt-2 text-sm font-semibold text-gray-700">Keterangan/Produk:</p>
                                <p className="text-sm text-gray-600">{selectedHutang.keterangan || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Kiri: Riwayat Penambahan Hutang */}
                            <div>
                                <h3 className="mb-3 font-bold text-md text-red-700">Riwayat Penambahan Hutang</h3>
                                {selectedHutang.riwayat_hutang && selectedHutang.riwayat_hutang.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-gray-600 bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2">Waktu</th>
                                                    <th className="px-4 py-2">Nominal</th>
                                                    <th className="px-4 py-2">Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {selectedHutang.riwayat_hutang.map((riwayat, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{formatDateTime(riwayat.created_at)}</td>
                                                        <td className="px-4 py-2 font-semibold text-red-600">{formatRupiah(riwayat.nominal_hutang)}</td>
                                                        <td className="px-4 py-2 text-gray-600">{riwayat.keterangan || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center border border-gray-200 rounded-lg bg-gray-50">
                                        <p className="text-sm text-gray-500">Belum ada riwayat penambahan detail.</p>
                                    </div>
                                )}
                            </div>

                            {/* Kanan: Riwayat Pembayaran/Cicilan */}
                            <div>
                                <h3 className="mb-3 font-bold text-md text-green-700">Riwayat Cicilan / Pembayaran</h3>
                                {selectedHutang.cicilan && selectedHutang.cicilan.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-gray-600 bg-gray-100">
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
                                    <div className="p-4 text-center border border-orange-100 rounded-lg bg-orange-50">
                                        <p className="text-sm text-orange-600">Belum ada riwayat pembayaran/cicilan.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 text-right">
                            <SecondaryButton onClick={() => setIsDetailModalOpen(false)}>Tutup</SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
