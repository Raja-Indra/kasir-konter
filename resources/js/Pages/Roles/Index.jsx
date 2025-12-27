import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function RoleIndex({ auth, roles, allPermissions }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editRole, setEditRole] = useState(null);

    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        permissions: []
    });

    // --- LOGIKA GROUPING PERMISSION ---
    // Mengelompokkan permission berdasarkan kata terakhir (users, products, dll)
    const groupedPermissions = allPermissions.reduce((acc, perm) => {
        const parts = perm.name.split(' '); // pisahkan "view users" jadi ["view", "users"]
        const group = parts.length > 1 ? parts[1] : 'other'; // ambil "users" sebagai nama grup

        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {});

    // Mapping nama grup ke Bahasa Indonesia agar cantik
    const groupLabels = {
        'dashboard': 'Dashboard',
        'users': 'Manajemen Pengguna',
        'products': 'Produk & Stok',
        'providers': 'Provider / Supplier',
        'transaction': 'Transaksi Kasir',
        'reports': 'Laporan & Riwayat',
        'debt': 'Kasbon / Hutang',
        'settings': 'Pengaturan Toko',
        'roles': 'Hak Akses (Roles)'
    };
    // ----------------------------------

    const handleCheckbox = (permName) => {
        if (data.permissions.includes(permName)) {
            setData('permissions', data.permissions.filter(p => p !== permName));
        } else {
            setData('permissions', [...data.permissions, permName]);
        }
    };

    // Fungsi centang semua dalam satu grup
    const handleCheckGroup = (groupName, check) => {
        const permsInGroup = groupedPermissions[groupName].map(p => p.name);
        if (check) {
            // Gabungkan permission yang sudah ada dengan permission grup ini (hindari duplikat)
            const newPerms = [...new Set([...data.permissions, ...permsInGroup])];
            setData('permissions', newPerms);
        } else {
            // Hapus permission grup ini dari state
            setData('permissions', data.permissions.filter(p => !permsInGroup.includes(p)));
        }
    };

    const openModal = (role = null) => {
        setIsEdit(!!role);
        setEditRole(role);
        setData({
            name: role ? role.name : '',
            permissions: role ? role.permissions.map(p => p.name) : []
        });
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        const action = isEdit ? put(route('roles.update', editRole.id)) : post(route('roles.store'));

        action.then(() => {
             setIsModalOpen(false);
             Swal.fire('Sukses', 'Data tersimpan', 'success');
        });
    };

    const deleteRole = (id) => {
        Swal.fire({
            title: 'Yakin hapus?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya'
        }).then((res) => {
            if(res.isConfirmed) router.delete(route('roles.destroy', id));
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Roles" />
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="p-6 bg-white shadow-sm sm:rounded-lg">
                    <div className="flex justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Roles & Hak Akses</h3>
                            <p className="text-sm text-gray-500">Buat jabatan baru dan atur izin secara rinci.</p>
                        </div>
                        <PrimaryButton onClick={() => openModal()}>+ Role Baru</PrimaryButton>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {roles.map(role => (
                            <div key={role.id} className="relative p-4 transition bg-white border rounded-lg hover:shadow-md">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-lg font-bold text-indigo-700 uppercase">{role.name}</h4>
                                    {role.name !== 'admin' && (
                                        <div className="flex space-x-2">
                                            <button onClick={() => openModal(role)} className="px-2 py-1 text-xs font-bold text-gray-500 border rounded hover:text-indigo-600">EDIT</button>
                                            <button onClick={() => deleteRole(role.id)} className="px-2 py-1 text-xs font-bold text-red-400 border rounded hover:text-red-600">HAPUS</button>
                                        </div>
                                    )}
                                    {role.name === 'admin' && <span className="px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded">Super User</span>}
                                </div>
                                <div className="pt-2 mt-2 text-xs text-gray-500 border-t">
                                    <p className="mb-1 font-semibold">Akses ({role.permissions.length}):</p>
                                    <div className="flex flex-wrap h-16 gap-1 overflow-hidden">
                                        {role.permissions.map(p => (
                                            <span key={p.id} className="px-1 bg-gray-100 rounded">{p.name}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL BESAR */}
            {/* MODAL (Ukuran Diperkecil jadi 2xl) */}
<Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="2xl">
    <form onSubmit={submit} className="p-6">
        <h2 className="pb-2 mb-4 text-lg font-bold text-gray-800 border-b">
            {isEdit ? `Edit Role: ${data.name}` : 'Buat Role Baru'}
        </h2>

        {/* Input Nama Role */}
        <div className="mb-4">
            <InputLabel value="Nama Jabatan / Role" className="mb-1 text-xs font-bold text-gray-500 uppercase" />
            <TextInput
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                className="w-full text-sm"
                placeholder="Contoh: Admin Gudang"
                required
            />
        </div>

        {/* List Permission (Scrollable) */}
        <div className="mb-4">
            <InputLabel value="Izin Akses" className="mb-2 text-xs font-bold text-gray-500 uppercase" />

            {/* Container dengan Border & Scroll */}
            <div className="border border-gray-200 rounded-lg bg-gray-50 h-[50vh] overflow-y-auto p-3 custom-scrollbar">
                {Object.keys(groupedPermissions).map((groupKey) => (
                    <div key={groupKey} className="mb-4 overflow-hidden bg-white border border-gray-100 rounded-md shadow-sm last:mb-0">

                        {/* Header Group (Klik tombol All/None) */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-indigo-100 bg-indigo-50">
                            <h5 className="text-xs font-bold text-indigo-800 uppercase">
                                {groupLabels[groupKey] || groupKey}
                            </h5>
                            <div className="text-[10px] space-x-2">
                                <button type="button" onClick={() => handleCheckGroup(groupKey, true)} className="font-bold text-indigo-600 hover:text-indigo-800">ALL</button>
                                <span className="text-gray-300">|</span>
                                <button type="button" onClick={() => handleCheckGroup(groupKey, false)} className="font-bold text-red-500 hover:text-red-700">NONE</button>
                            </div>
                        </div>

                        {/* List Checkbox */}
                        <div className="grid grid-cols-2 gap-2 p-2">
                            {groupedPermissions[groupKey].map(perm => (
                                <label key={perm.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.permissions.includes(perm.name)}
                                        onChange={() => handleCheckbox(perm.name)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-xs font-medium text-gray-700">
                                        {/* Hapus nama grup agar teks pendek. Contoh: "view users" -> "view" */}
                                        {perm.name.replace(groupKey, '').trim() || perm.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 text-right">*Centang fitur yang boleh diakses jabatan ini.</p>
        </div>

        {/* Footer Tombol */}
        <div className="sticky bottom-0 flex justify-end pt-3 bg-white border-t">
            <SecondaryButton onClick={() => setIsModalOpen(false)} className="text-xs">Batal</SecondaryButton>
            <PrimaryButton className="ml-2 text-xs" disabled={processing}>Simpan</PrimaryButton>
        </div>
    </form>
</Modal>
        </AuthenticatedLayout>
    );
}
