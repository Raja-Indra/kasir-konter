import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import usePermission from '@/Hooks/usePermission';

const MySwal = withReactContent(Swal);

export default function KategoriIndex({ auth, kategoris }) {
    const { can } = usePermission();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        nama_kategori: '',
    });

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (kategori) => {
        setIsEditMode(true);
        setEditingId(kategori.id);
        setData('nama_kategori', kategori.nama_kategori);
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            put(route('kategori.update', editingId), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Kategori berhasil diperbarui!' });
                }
            });
        } else {
            post(route('kategori.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Kategori berhasil ditambahkan!' });
                }
            });
        }
    };

    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Hapus Kategori?',
            text: "Kategori ini akan dihapus secara permanen (Pastikan tidak ada produk yang menggunakan kategori ini).",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('kategori.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon: 'success', title: 'Kategori berhasil dihapus!' });
                    },
                    onError: (errors) => {
                        Swal.fire({
                            title: 'Gagal Menghapus!',
                            text: errors.error || 'Kategori tidak dapat dihapus.',
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen Kategori</h2>}
        >
            <Head title="Kategori Produk" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">
                            <div className="flex flex-col justify-between gap-4 p-4 mb-6 text-white rounded-lg shadow-md md:flex-row md:items-center bg-gradient-to-r from-blue-800 to-blue-500">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold">Daftar Jenis Produk</h3>
                                </div>
                                <div className="flex flex-col items-center w-full gap-3 sm:flex-row md:w-auto">
                                    {can('create categories') && (
                                        <PrimaryButton className="!bg-white !text-blue-800 hover:!bg-gray-100 whitespace-nowrap w-full sm:w-auto justify-center" onClick={openCreateModal}>
                                            + Tambah Jenis Produk
                                        </PrimaryButton>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left">No</th>
                                            <th className="px-4 py-3 text-left">Jenis Produk</th>
                                            {(can('edit categories') || can('delete categories')) && (
                                                <th className="px-4 py-3 text-right">Aksi</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {kategoris && kategoris.length > 0 ? (
                                            kategoris.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{index + 1}</td>
                                                    <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{item.nama_kategori}</td>
                                                    {(can('edit categories') || can('delete categories')) && (
                                                        <td className="px-4 py-3 text-sm font-medium text-right whitespace-nowrap">
                                                            {can('edit categories') && (
                                                                <button onClick={() => openEditModal(item)} className="mr-4 text-blue-600 transition hover:text-blue-900">Edit</button>
                                                            )}
                                                            {can('delete categories') && (
                                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 transition hover:text-red-900">Hapus</button>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={(can('edit categories') || can('delete categories')) ? 3 : 2} className="px-6 py-10 italic text-center text-gray-500">
                                                    Belum ada data kategori.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Modal */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        {isEditMode ? 'Edit Jenis Produk' : 'Tambah Jenis Produk'}
                    </h2>

                    <div>
                        <InputLabel htmlFor="nama_kategori" value="Jenis Produk" />
                        <TextInput
                            id="nama_kategori"
                            type="text"
                            className="block w-full mt-1"
                            value={data.nama_kategori}
                            onChange={(e) => setData('nama_kategori', e.target.value)}
                            placeholder="Contoh: Pulsa"
                            isFocused
                        />
                        <InputError message={errors.nama_kategori} className="mt-2" />
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
