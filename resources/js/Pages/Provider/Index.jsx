import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
// Import SweetAlert2
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ProviderIndex({ auth, providers }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [providerToEdit, setProviderToEdit] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_provider: '',
        saldo: 0,
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
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
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
                // Jika user klik Ya, baru eksekusi Inertia delete
                router.delete(route('providers.destroy', id), {
                    onSuccess: () => {
                        // Tampilkan pesan sukses setelah berhasil dihapus
                        MySwal.fire(
                            'Terhapus!',
                            'Data provider berhasil dihapus.',
                            'success'
                        );
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

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Provider Manajement</h3>
                            <PrimaryButton onClick={openCreateModal}>+ Tambah Provider</PrimaryButton>
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
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {providers.length > 0 ? (
                                        // AMBIL INDEX DARI MAP
                                        providers.map((item, index) => (
                                            <tr key={item.id}>
                                                {/* TAMPILKAN NOMOR URUT (Index + 1) */}
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {index + 1}
                                                </td>

                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.nama_provider}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">Rp {parseFloat(item.saldo).toLocaleString('id-ID')}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="mr-4 text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
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
                        <InputLabel htmlFor="saldo" value="Saldo Awal" />
                        <TextInput
                            id="saldo"
                            type="number"
                            className="block w-full mt-1"
                            value={data.saldo}
                            onChange={(e) => setData('saldo', e.target.value)}
                        />
                        <InputError message={errors.saldo} className="mt-2" />
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>
                            {isEditMode ? 'Simpan Perubahan' : 'Simpan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
