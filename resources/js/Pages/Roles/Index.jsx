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
        'history': 'Riwayat Transaksi',
        'reports': 'Laporan Penjualan',
        'debt': 'Kasbon / Hutang',
        'settings': 'Pengaturan Toko',
        'roles': 'Hak Akses (Roles)'
    };
    
    // Translasi action permission
    const translateAction = (actionName) => {
        const actionMap = {
            'view': 'Lihat',
            'create': 'Tambah',
            'edit': 'Ubah',
            'delete': 'Hapus',
            'manage': 'Kelola',
            'pay': 'Bayar'
        };
        return actionMap[actionName] || actionName;
    };
    // ----------------------------------

    const handleCheckbox = (permName) => {
        if (data.permissions.includes(permName)) {
            setData('permissions', data.permissions.filter(p => p !== permName));
        } else {
            let newPerms = [...data.permissions, permName];
            
            // Aturan khusus: hanya boleh 1 dashboard yang terpilih
            if (permName === 'view dashboard owner') {
                newPerms = newPerms.filter(p => p !== 'view dashboard kasir' && p !== 'view dashboard admin');
            } else if (permName === 'view dashboard admin') {
                newPerms = newPerms.filter(p => p !== 'view dashboard kasir' && p !== 'view dashboard owner');
            } else if (permName === 'view dashboard kasir') {
                newPerms = newPerms.filter(p => p !== 'view dashboard owner' && p !== 'view dashboard admin');
            }
            
            setData('permissions', newPerms);
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
        
        const options = {
            onSuccess: () => {
                setIsModalOpen(false);
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Data tersimpan', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            }
        };

        if (isEdit) {
            put(route('roles.update', editRole.id), options);
        } else {
            post(route('roles.store'), options);
        }
    };

    const deleteRole = (id) => {
        Swal.fire({
            title: 'Yakin hapus?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Ya'
        }).then((res) => {
            if(res.isConfirmed) {
                router.delete(route('roles.destroy', id), {
                    onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Role dihapus', showConfirmButton: false, timer: 3000, timerProgressBar: true })
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manajemen Roles" />
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="p-6 bg-white shadow-sm sm:rounded-lg">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 mb-6 text-white rounded-xl shadow-md bg-gradient-to-r from-blue-700 to-blue-500">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-xl font-bold">Daftar Role & Akses</h3>
                            <p className="text-sm text-blue-100 mt-1">Atur hak akses karyawan untuk setiap fitur aplikasi.</p>
                        </div>
                        <button 
                            onClick={() => openModal()} 
                            className="px-4 py-2 text-sm font-bold text-blue-700 transition bg-white rounded-lg shadow hover:bg-gray-50 focus:ring-4 focus:ring-blue-300"
                        >
                            + Tambah Role
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {roles.map(role => (
                            <div key={role.id} className="flex flex-col p-5 transition bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-200">
                                <div className="flex items-start justify-between mb-4 border-b border-gray-100 pb-3">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 capitalize">{role.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{role.permissions.length} Hak Akses</p>
                                    </div>
                                    {role.name.toLowerCase() !== 'owner' && (
                                        <div className="flex space-x-2">
                                            <button onClick={() => openModal(role)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition">Edit</button>
                                            <button onClick={() => deleteRole(role.id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition">Hapus</button>
                                        </div>
                                    )}
                                    {role.name.toLowerCase() === 'owner' && <span className="px-3 py-1 text-xs font-bold text-purple-700 bg-purple-100 rounded-full">Owner</span>}
                                </div>
                                <div className="flex-1">
                                    {role.name.toLowerCase() === 'owner' ? (
                                        <div className="p-3 text-sm text-center text-purple-700 bg-purple-50 rounded-lg border border-purple-100">
                                            Role ini memiliki <b>semua</b> hak akses sistem tanpa batas.
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                            {role.permissions.length > 0 ? role.permissions.map(p => {
                                                const action = p.name.split(' ')[0];
                                                const group = p.name.split(' ')[1] || 'other';
                                                
                                                // Warna badge berdasarkan action (view, create, etc)
                                                let badgeClass = "bg-gray-100 text-gray-700 border-gray-200";
                                                if(action === 'view') badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                                                if(action === 'create') badgeClass = "bg-green-50 text-green-700 border-green-200";
                                                if(action === 'edit' || action === 'manage') badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
                                                if(action === 'delete') badgeClass = "bg-red-50 text-red-700 border-red-200";

                                                let labelText = `${translateAction(action)} ${groupLabels[group] || group}`;
                                                if (p.name === 'view dashboard owner') labelText = 'Dashboard Owner';
                                                if (p.name === 'view dashboard admin') labelText = 'Dashboard Admin';
                                                if (p.name === 'view dashboard kasir') labelText = 'Dashboard Kasir';

                                                return (
                                                    <span key={p.id} className={`px-2 py-1 text-[10px] font-medium border rounded-md ${badgeClass}`}>
                                                        {labelText}
                                                    </span>
                                                );
                                            }) : (
                                                <span className="text-sm text-gray-400 italic">Belum ada hak akses.</span>
                                            )}
                                        </div>
                                    )}
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
                    <div className="flex items-center justify-between pb-3 mb-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">
                            {isEdit ? `Edit Akses: ${data.name}` : 'Buat Role Baru'}
                        </h2>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    {/* Input Nama Role */}
                    <div className="mb-5">
                        <InputLabel value="Nama Role" className="mb-1 text-sm font-bold text-gray-700" />
                        <TextInput
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full"
                            placeholder="Contoh: Kasir Shift Pagi"
                            required
                            disabled={isEdit && editRole?.name.toLowerCase() === 'owner'}
                        />
                    </div>

                    {/* List Permission (Scrollable) */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <InputLabel value="Pengaturan Izin Fitur" className="text-sm font-bold text-gray-700" />
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {data.permissions.length} Terpilih
                            </span>
                        </div>

                        {/* Container dengan Border & Scroll */}
                        <div className="border border-gray-200 rounded-xl bg-gray-50/50 h-[45vh] overflow-y-auto p-4 custom-scrollbar space-y-4">
                            {Object.keys(groupedPermissions).map((groupKey) => (
                                <div key={groupKey} className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                                    {/* Header Group */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                        <h5 className="text-sm font-bold text-gray-800">
                                            {groupLabels[groupKey] || groupKey}
                                        </h5>
                                        <div className="flex items-center space-x-3">
                                            {groupKey !== 'dashboard' && (
                                                <button type="button" onClick={() => handleCheckGroup(groupKey, true)} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">PILIH SEMUA</button>
                                            )}
                                            <button type="button" onClick={() => handleCheckGroup(groupKey, false)} className="text-[11px] font-bold text-gray-500 hover:text-gray-700 bg-gray-200 px-2 py-1 rounded">BATALKAN</button>
                                        </div>
                                    </div>

                                    {/* List Checkbox */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                                        {groupedPermissions[groupKey].map(perm => {
                                            const action = perm.name.split(' ')[0];
                                            const isChecked = data.permissions.includes(perm.name);
                                            
                                            let labelText = translateAction(action);
                                            if (perm.name === 'view dashboard owner') labelText = 'Owner';
                                            if (perm.name === 'view dashboard admin') labelText = 'Admin';
                                            if (perm.name === 'view dashboard kasir') labelText = 'Kasir';

                                            return (
                                                <label key={perm.id} className={`flex items-center space-x-2 cursor-pointer p-2 rounded-md transition select-none border ${isChecked ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleCheckbox(perm.name)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className={`text-sm font-medium ${isChecked ? 'text-blue-700' : 'text-gray-700'}`}>
                                                        {labelText}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Tombol */}
                    <div className="flex justify-end pt-4 border-t gap-2">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-blue-600 hover:bg-blue-700">Simpan Perubahan</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
