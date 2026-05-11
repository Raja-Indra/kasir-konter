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
import usePermission from '@/Hooks/usePermission';

const MySwal = withReactContent(Swal);

export default function UserIndex({ auth, users, roles }) {
    const { can } = usePermission();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); 

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        no_hp: '',
        password: '',
        password_confirmation: '',
        role: 'kasir', // Default role
        is_active: true,
        foto: null, 
        _method: 'POST' 
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('foto', file);
            setPreviewImage(URL.createObjectURL(file)); 
        }
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setUserToEdit(null);
        setPreviewImage(null);
        reset();
        clearErrors();
        setData({
            name: '', email: '', no_hp: '', password: '', password_confirmation: '', role: roles.length > 0 ? roles[0].name : 'kasir', is_active: true, foto: null, _method: 'POST'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setIsEditMode(true);
        setUserToEdit(user);
        setPreviewImage(user.foto ? `/storage/${user.foto}` : null);
        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            no_hp: user.no_hp || '',
            password: '', 
            password_confirmation: '',
            // Ambil role pertama user (jika ada), kalau tidak default kasir
            role: user.roles && user.roles.length > 0 ? user.roles[0].name : (roles.length > 0 ? roles[0].name : 'kasir'),
            is_active: user.is_active ? true : false,
            foto: null, 
            _method: 'PUT' 
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
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">

                        <div className="flex items-center justify-between p-4 mb-6 text-white rounded-lg shadow-md bg-gradient-to-r from-blue-800 to-blue-500">
                            <h3 className="text-lg font-bold">Daftar Pengguna / Kasir</h3>
                            {can('create users') && (
                                <PrimaryButton className="!bg-white !text-blue-800 hover:!bg-gray-100" onClick={openCreateModal}>+ Tambah User</PrimaryButton>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                        {(can('edit users') || can('delete users')) && (
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {user.foto ? (
                                                            <img className="h-10 w-10 rounded-full object-cover" src={`/storage/${user.foto}`} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>

                                                        {/* --- PERBAIKAN DI SINI (ID String) --- */}
                                                        <div className="text-xs text-gray-500">
                                                            ID: ...{String(user.id).slice(-8)}
                                                        </div>
                                                        {/* ----------------------------------- */}

                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                <div className="text-sm text-gray-500">{user.no_hp || '-'}</div>
                                            </td>

                                            {/* Kolom Role */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {user.roles && user.roles.length > 0 ? (
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.roles[0].name.toLowerCase() === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {user.roles[0].name.toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {user.is_active ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            {(can('edit users') || can('delete users')) && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {can('edit users') && (
                                                        <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                                    )}
                                                    {can('delete users') && user.id !== auth.user.id && (
                                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                                    )}
                                                </td>
                                            )}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Foto Profil Preview */}
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center mb-4">
                            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300 mb-2">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">No Img</div>
                                )}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                        <div>
                            <InputLabel htmlFor="password" value={isEditMode ? "Password (Kosongkan jika tidak diganti)" : "Password"} />
                            <TextInput 
                                id="password" 
                                type="password" 
                                className="block w-full mt-1" 
                                value={data.password} 
                                onChange={(e) => setData('password', e.target.value)} 
                                required={!isEditMode} 
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                            <TextInput 
                                id="password_confirmation" 
                                type="password" 
                                className="block w-full mt-1" 
                                value={data.password_confirmation} 
                                onChange={(e) => setData('password_confirmation', e.target.value)} 
                                required={!isEditMode || data.password.length > 0} 
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        {/* Pilihan Role */}
                        <div className="col-span-2">
                            <InputLabel htmlFor="role" value="Role / Jabatan" />
                            <select
                                id="role"
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm mt-1 block w-full"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                            >
                                {roles.map((r) => (
                                    <option key={r.id} value={r.name}>
                                        {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Aktif */}
                        <div className="col-span-2 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 w-5 h-5"
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