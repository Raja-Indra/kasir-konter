import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Checkbox from '@/Components/Checkbox';
// Import SweetAlert2
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import usePermission from '@/Hooks/usePermission';

const MySwal = withReactContent(Swal);

export default function ProviderIndex({ auth, providers }) {
    const { can } = usePermission();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [providerToEdit, setProviderToEdit] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState(''); // State Pencarian

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

    // --- STATE & FORM UNTUK TAMBAH SALDO ---
    const [isAddSaldoModalOpen, setIsAddSaldoModalOpen] = useState(false);
    const [providerToAddSaldo, setProviderToAddSaldo] = useState(null);
    const { 
        data: saldoData, 
        setData: setSaldoData, 
        post: postSaldo, 
        processing: saldoProcessing, 
        errors: saldoErrors, 
        reset: resetSaldo, 
        clearErrors: clearSaldoErrors 
    } = useForm({
        tambah_saldo: '',
    });

    const filteredProviders = providers.filter(provider => 
        provider.nama_provider.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_provider: '',
        saldo: 0,
        is_digital: true,
    });

    const openCreateModal = () => {
        setIsEditMode(false);
        setProviderToEdit(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (provider) => {
        setIsEditMode(true);
        setProviderToEdit(provider);
        setData({
            nama_provider: provider.nama_provider,
            saldo: provider.saldo,
            is_digital: provider.is_digital ?? true,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const openAddSaldoModal = (provider) => {
        setProviderToAddSaldo(provider);
        resetSaldo();
        clearSaldoErrors();
        setIsAddSaldoModalOpen(true);
    };

    const closeAddSaldoModal = () => {
        setIsAddSaldoModalOpen(false);
        resetSaldo();
    };

    const handleAddSaldoSubmit = (e) => {
        e.preventDefault();
        const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
        MySwal.fire({
            title: 'Tambah Saldo?',
            text: `Tambah saldo sejumlah ${formatRupiah(saldoData.tambah_saldo)} untuk ${providerToAddSaldo.nama_provider}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Tambah',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                postSaldo(route('providers.add_saldo', providerToAddSaldo.id), {
                    onSuccess: () => {
                        closeAddSaldoModal();
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true
                        });
                        Toast.fire({
                            icon: 'success',
                            title: 'Saldo berhasil ditambahkan'
                        });
                    },
                });
            }
        });
    };

    // --- LOGIKA SUBMIT DENGAN KONFIRMASI ---
    const handleSubmit = (e) => {
        e.preventDefault();

        const actionText = isEditMode ? 'mengubah data' : 'menambahkan data';

        MySwal.fire({
            title: 'Simpan Data?',
            text: `Apakah Anda yakin ingin ${actionText} ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Simpan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {

                const options = {
                    onSuccess: () => {
                        closeModal();
                        // Alert sukses kecil di pojok kanan atas (Toast style)
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true
                        });

                        Toast.fire({
                            icon: 'success',
                            title: 'Data berhasil disimpan'
                        });
                    },
                    onError: (errors) => {
                        if (errors.nama_provider) {
                            MySwal.fire({
                                icon: 'error',
                                title: 'Gagal Menyimpan',
                                text: errors.nama_provider,
                            });
                        }
                    },
                };

                if (isEditMode) {
                    put(route('providers.update', providerToEdit.id), options);
                } else {
                    post(route('providers.store'), options);
                }
            }
        });
    };

    // --- LOGIKA HAPUS DENGAN KONFIRMASI ---
    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Warna merah untuk tombol hapus
            cancelButtonColor: '#3085d6', // Warna biru untuk batal
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('providers.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            icon: 'success',
                            title: 'Data provider berhasil dihapus'
                        });
                    },
                    onError: (errors) => {
                        Swal.fire({
                            title: 'Gagal Menghapus!',
                            text: errors.error || 'Provider tidak dapat dihapus.',
                            icon: 'error',
                            confirmButtonColor: '#3085d6'
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Provider" />

            {/* UBAH DI SINI: py-12 agar ada jarak atas bawah, atau kurangi jadi py-6 */}
            <div className="py-6">
                {/* UBAH DI SINI: max-w-7xl diganti jadi max-w-full (agar lebar mentok) */}
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">

                        <div className="flex flex-col justify-between gap-4 p-4 mb-6 text-white rounded-lg shadow-md sm:flex-row sm:items-center bg-gradient-to-r from-blue-800 to-blue-500">
                            <h3 className="text-lg font-bold">Provider Manajement</h3>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari provider..."
                                        className="block w-full py-2 pl-10 pr-3 text-sm text-gray-900 bg-white border-none rounded-md shadow-inner focus:ring-blue-300 focus:border-blue-300 sm:w-64"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />
                                </div>
                                {can('create providers') && (
                                    <PrimaryButton className="!bg-white !text-blue-800 hover:!bg-gray-100" onClick={openCreateModal}>+ Tambah Provider</PrimaryButton>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {/* Tambahkan w-full pada tabel agar tabelnya juga melar */}
                            <table className="w-full min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {/* GANTI HEADER JADI NOMOR URUT */}
                                        <th className="w-16 px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">No</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nama Provider</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Saldo</th>
                                        {(can('edit providers') || can('delete providers')) && (
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Aksi</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProviders.length > 0 ? (
                                        // AMBIL INDEX DARI MAP
                                        filteredProviders.map((item, index) => (
                                            <tr key={item.id}>
                                                {/* TAMPILKAN NOMOR URUT (Index + 1) */}
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {index + 1}
                                                </td>

                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.nama_provider}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.is_digital === false 
                                                        ? <span className="px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded-full">Gudang Fisik</span> 
                                                        : `Rp ${parseFloat(item.saldo).toLocaleString('id-ID')}`}
                                                </td>
                                                {(can('edit providers') || can('delete providers')) && (
                                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                        {item.is_digital !== false && can('edit providers') && (
                                                            <button
                                                                onClick={() => openAddSaldoModal(item)}
                                                                className="mr-4 text-green-600 transition hover:text-green-900"
                                                            >
                                                                Tambah Saldo
                                                            </button>
                                                        )}
                                                        {can('edit providers') && (
                                                            <button
                                                                onClick={() => openEditModal(item)}
                                                                className="mr-4 text-blue-600 transition hover:text-blue-900"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        {can('delete providers') && (
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="text-red-600 transition hover:text-red-900"
                                                            >
                                                                Hapus
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Belum ada data provider.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        {isEditMode ? 'Edit Provider' : 'Tambah Provider Baru'}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="nama_provider" value="Nama Provider" />
                        <TextInput
                            id="nama_provider"
                            type="text"
                            className="block w-full mt-1"
                            value={data.nama_provider}
                            onChange={(e) => setData('nama_provider', e.target.value)}
                            isFocused
                            placeholder="Contoh: Telkomsel"
                        />
                        <InputError message={errors.nama_provider} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center">
                            <Checkbox
                                name="is_digital"
                                checked={data.is_digital}
                                onChange={(e) => setData('is_digital', e.target.checked)}
                            />
                            <span className="ms-2 text-sm text-gray-600">Provider Digital (Pulsa, Token, dll)</span>
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                            Hapus centang jika ini adalah Gudang Fisik (Aksesoris, Perdana, dll).
                        </p>
                        <InputError message={errors.is_digital} className="mt-2" />
                    </div>

                    {data.is_digital && (
                        <div className="mb-4">
                            <InputLabel htmlFor="saldo" value="Saldo Awal" />
                            <TextInput
                                id="saldo"
                                type="text"
                                inputMode="numeric"
                                className="block w-full mt-1"
                                value={formatInputRupiah(data.saldo)}
                                onChange={(e) => setData('saldo', parseInputRupiah(e.target.value))}
                            />
                            <InputError message={errors.saldo} className="mt-2" />
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>
                            {isEditMode ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={isAddSaldoModalOpen} onClose={closeAddSaldoModal}>
                <form onSubmit={handleAddSaldoSubmit} className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        Tambah Saldo untuk {providerToAddSaldo?.nama_provider}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="tambah_saldo" value="Nominal Tambahan (Rp)" />
                        <TextInput
                            id="tambah_saldo"
                            type="text"
                            inputMode="numeric"
                            className="block w-full mt-1"
                            value={formatInputRupiah(saldoData.tambah_saldo)}
                            onChange={(e) => setSaldoData('tambah_saldo', parseInputRupiah(e.target.value))}
                            isFocused
                            placeholder="Contoh: 50.000"
                        />
                        <InputError message={saldoErrors.tambah_saldo} className="mt-2" />
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={closeAddSaldoModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={saldoProcessing}>
                            Tambah Saldo
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
