import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function UserIndex({ auth, users }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // State untuk preview foto

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        no_hp: '',
        password: '',
        role: 'kasir',
        is_active: true,
        foto: null, // File object
        _method: 'POST' // Trick untuk Laravel agar bisa PUT file upload
    });

    // Handle Perubahan File Input
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('foto', file);
            setPreviewImage(URL.createObjectURL(file)); // Buat URL sementara untuk preview
        }
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setUserToEdit(null);
        setPreviewImage(null);
        reset();
        clearErrors();
        setData({
            name: '', email: '', no_hp: '', password: '', is_active: true, foto: null, _method: 'POST'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setIsEditMode(true);
        setUserToEdit(user);

        // Tampilkan foto lama jika ada
        setPreviewImage(user.foto ? `/storage/${user.foto}` : null);

        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            no_hp: user.no_hp || '',
            password: '', // Password dikosongkan saat edit
            is_active: user.is_active ? true : false,
            foto: null, // Reset input file
            _method: 'PUT' // Penting! Ubah method jadi PUT untuk update
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const actionText = isEditMode ? 'mengubah data user' : 'menambahkan user baru';

        MySwal.fire({
            title: 'Simpan Data?',
            text: `Yakin ingin ${actionText} ini?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Simpan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // Gunakan POST untuk kirim file, tapi dengan _method: PUT/POST di dalam body
                const routeName = isEditMode ? route('users.update', userToEdit.id) : route('users.store');

                post(routeName, {
                    onSuccess: () => {
                        closeModal();
                        MySwal.fire('Berhasil!', 'Data user tersimpan.', 'success');
                    }
                });
            }
        });
    };

    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Hapus User?',
            text: "Data tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('users.destroy', id), {
                    onSuccess: () => MySwal.fire('Terhapus!', 'User berhasil dihapus.', 'success')
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen User" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">

                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Daftar Pengguna / Kasir</h3>
                            <PrimaryButton onClick={openCreateModal}>+ Tambah User</PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Kontak</th>
                                        <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-right text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-10 h-10">
                                                        {user.foto ? (
                                                            <img className="object-cover w-10 h-10 rounded-full" src={`/storage/${user.foto}`} alt="" />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-10 h-10 font-bold text-gray-500 bg-gray-200 rounded-full">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-xs text-gray-500">ID: ...{user.id.substr(-8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                <div className="text-sm text-gray-500">{user.no_hp || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                {user.is_active ? (
                                                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-red-800 bg-red-100 rounded-full">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                <button onClick={() => openEditModal(user)} className="mr-4 text-indigo-600 hover:text-indigo-900">Edit</button>
                                                {/* Jangan biarkan user menghapus dirinya sendiri */}
                                                {user.id !== auth.user.id && (
                                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        {isEditMode ? 'Edit User' : 'Tambah User Baru'}
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Foto Profil Preview */}
                        <div className="flex flex-col items-center col-span-1 mb-4 md:col-span-2">
                            <div className="w-24 h-24 mb-2 overflow-hidden bg-gray-100 border-2 border-gray-300 rounded-full">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="object-cover w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-gray-400">No Img</div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                            <InputError message={errors.foto} className="mt-2" />
                        </div>

                        {/* Nama */}
                        <div className="col-span-2">
                            <InputLabel htmlFor="name" value="Nama Lengkap" />
                            <TextInput id="name" type="text" className="block w-full mt-1" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput id="email" type="email" className="block w-full mt-1" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        {/* No HP */}
                        <div>
                            <InputLabel htmlFor="no_hp" value="No. HP / WhatsApp" />
                            <TextInput id="no_hp" type="text" className="block w-full mt-1" value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} />
                            <InputError message={errors.no_hp} className="mt-2" />
                        </div>

                        {/* Password */}
                        <div className="col-span-2">
                            <InputLabel htmlFor="password" value={isEditMode ? "Password (Kosongkan jika tidak diganti)" : "Password"} />
                            <TextInput
                                id="password"
                                type="password"
                                className="block w-full mt-1"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required={!isEditMode} // Wajib hanya saat create
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>
                        
                        {/* Pilihan Role */}
                        <div className="col-span-2">
                            <InputLabel htmlFor="role" value="Role / Jabatan" />
                            <select
                                id="role"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                            >
                                <option value="kasir">Kasir (Transaksi Saja)</option>
                                <option value="admin">Admin (Akses Penuh)</option>
                            </select>
                        </div>

                        {/* Status Aktif */}
                        <div className="col-span-2 p-3 mt-2 border border-gray-200 rounded bg-gray-50">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded shadow-sm focus:ring-indigo-500"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <div className="ms-3">
                                    <span className="block text-sm font-medium text-gray-900">Akun Aktif</span>
                                    <span className="block text-xs text-gray-500">Jika dimatikan, user tidak bisa login.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>Simpan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
