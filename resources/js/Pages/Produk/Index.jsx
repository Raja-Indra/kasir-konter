import { useState, useEffect } from 'react';
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

export default function ProdukIndex({ auth, products, providers }) {
    // State Tab (Default ke Digital)
    const [activeTab, setActiveTab] = useState('digital');
    const [searchKeyword, setSearchKeyword] = useState(''); // State Pencarian

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    // Filter Data Berdasarkan Tab dan Pencarian
    const filteredProducts = products.filter(product => {
        const matchTab = activeTab === 'digital' ? product.is_digital : !product.is_digital;
        const matchSearch = product.nama_produk.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                            (product.provider && product.provider.nama_provider.toLowerCase().includes(searchKeyword.toLowerCase()));
        return matchTab && matchSearch;
    });

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        provider_id: '',
        nama_produk: '',
        harga_modal: '',
        harga_jual: '',
        stok: 0,
        jenis: '',
        is_digital: true,
        is_tarik_tunai: false,
        is_flexible_price: false,
    });

    // Reset stok jika pindah ke mode digital di form
    useEffect(() => {
        if (data.is_flexible_price) {
            setData(data => ({ ...data, harga_modal: 0 }));
        }

        if (data.is_digital) {
            setData('stok', 0);
        }
    }, [data.is_digital, data.is_flexible_price]);

    const openCreateModal = () => {
        setIsEditMode(false);
        setProductToEdit(null);
        reset();
        clearErrors();

        // Otomatis set checkbox form sesuai tab yang sedang aktif
        setData(d => ({
            ...d,
            provider_id: providers.length > 0 ? providers[0].id : '',
            is_digital: activeTab === 'digital'
        }));

        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setIsEditMode(true);
        setProductToEdit(item);
        setData({
            provider_id: item.provider_id,
            nama_produk: item.nama_produk,
            harga_modal: item.harga_modal,
            harga_jual: item.harga_jual,
            stok: item.stok,
            jenis: item.jenis,
            is_digital: item.is_digital ? true : false,
            is_tarik_tunai: item.is_tarik_tunai ? true : false,
            is_flexible_price: item.is_flexible_price ? true : false,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const actionText = isEditMode ? 'mengubah produk' : 'menambahkan produk';

        MySwal.fire({
            title: 'Simpan Data?',
            text: `Yakin ingin ${actionText} ini?`,
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
                        const Toast = Swal.mixin({
                            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
                        });
                        Toast.fire({ icon: 'success', title: 'Berhasil disimpan' });
                    },
                };

                if (isEditMode) {
                    put(route('produk.update', productToEdit.id), options);
                } else {
                    post(route('produk.store'), options);
                }
            }
        });
    };

    const handleDelete = (id) => {
        MySwal.fire({
            title: 'Hapus Produk?',
            text: "Data tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('produk.destroy', id), {
                    onSuccess: () => {
                        MySwal.fire('Terhapus!', 'Produk berhasil dihapus.', 'success');
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Produk" />

            <div className="py-6">
                <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">

                        <div className="flex flex-col justify-between gap-4 p-4 mb-6 text-white rounded-lg shadow-md sm:flex-row sm:items-center bg-gradient-to-r from-blue-800 to-blue-500">
                            <h3 className="text-lg font-bold">Daftar Produk</h3>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau provider..."
                                        className="block w-full py-2 pl-10 pr-3 text-sm text-gray-900 bg-white border-none rounded-md shadow-inner focus:ring-blue-300 focus:border-blue-300 sm:w-64"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                    />
                                </div>
                                <PrimaryButton className="!bg-white !text-blue-800 hover:!bg-gray-100" onClick={openCreateModal}>+ Tambah Produk</PrimaryButton>
                            </div>
                        </div>

                        {/* --- TAB NAVIGATION (BARU) --- */}
                        <div className="mb-6 border-b border-gray-200">
                            <nav className="flex -mb-px space-x-8">
                                <button
                                    onClick={() => setActiveTab('digital')}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                        ${activeTab === 'digital'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    📱 Produk Digital
                                    <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2.5 rounded-full text-xs">
                                        {products.filter(p => p.is_digital).length}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('fisik')}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                        ${activeTab === 'fisik'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    📦 Produk Fisik
                                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                                        {products.filter(p => !p.is_digital).length}
                                    </span>
                                </button>
                            </nav>
                        </div>
                        {/* ----------------------------- */}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">No</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Provider</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nama Produk</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Jenis</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Modal</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Jual</th>

                                        {/* Kolom Stok Dinamis (Hanya muncul jika tab Fisik, atau label lain jika Digital) */}
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                                            {activeTab === 'fisik' ? 'Sisa Stok' : 'Status'}
                                        </th>

                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-blue-600">
                                                    {item.provider ? item.provider.nama_provider : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                    <div>{item.nama_produk}</div>
                                                    {item.is_flexible_price && (item.min_nominal || item.max_nominal) && (
                                                        <div className="mt-1 text-[11px] font-normal text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded border border-blue-100">
                                                            Range: {item.min_nominal ? `Rp ${parseFloat(item.min_nominal).toLocaleString('id-ID')}` : '0'} - {item.max_nominal ? `Rp ${parseFloat(item.max_nominal).toLocaleString('id-ID')}` : '∞'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activeTab === 'digital' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                                        {item.jenis}
                                                    </span>
                                                    {/* {item.is_tarik_tunai && (
                                                        <span className="ml-2 px-2 inline-flex text-[10px] leading-5 font-bold rounded-full bg-green-100 text-green-800">
                                                            Tarik Tunai
                                                        </span>
                                                    )} */}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">Rp {parseFloat(item.harga_modal).toLocaleString('id-ID')}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-green-600">Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}</td>

                                                <td className="px-6 py-4 text-sm text-center">
                                                    {activeTab === 'digital' ? (
                                                        <span className="px-2 py-1 text-xs font-bold text-green-600 uppercase border border-green-200 rounded bg-green-50">
                                                            Ready
                                                        </span>
                                                    ) : (
                                                        item.stok <= 5 ? (
                                                            <span className="font-bold text-red-600 animate-pulse">{item.stok} Unit</span>
                                                        ) : (
                                                            <span className="font-medium text-gray-900">{item.stok} Unit</span>
                                                        )
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                    <button onClick={() => openEditModal(item)} className="mr-4 text-blue-600 transition hover:text-blue-900">Edit</button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 transition hover:text-red-900">Hapus</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="8" className="px-6 py-10 italic text-center text-gray-500">
                                            Tidak ada data untuk {activeTab === 'digital' ? 'Produk Digital' : 'Produk Fisik'}.
                                        </td></tr>
                                    )}
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
                        {isEditMode ? 'Edit Produk' : `Tambah Produk ${activeTab === 'digital' ? 'Digital' : 'Fisik'}`}
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Pilih Provider */}
                        <div className="col-span-2">
                            <InputLabel htmlFor="provider_id" value="Provider" />
                            <select
                                id="provider_id"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={data.provider_id}
                                onChange={(e) => setData('provider_id', e.target.value)}
                            >
                                <option value="">-- Pilih Provider --</option>
                                {providers.map((prov) => (
                                    <option key={prov.id} value={prov.id}>{prov.nama_provider}</option>
                                ))}
                            </select>
                            <InputError message={errors.provider_id} className="mt-2" />
                        </div>

                        {/* Nama Produk */}
                        <div className="col-span-2">
                            <InputLabel htmlFor="nama_produk" value="Nama Produk" />
                            <TextInput
                                id="nama_produk"
                                type="text"
                                className="block w-full mt-1"
                                value={data.nama_produk}
                                onChange={(e) => setData('nama_produk', e.target.value)}
                                placeholder="Contoh: Pulsa 10.000 / Kabel Data C"
                            />
                            <InputError message={errors.nama_produk} className="mt-2" />
                        </div>

                        {/* Jenis Manual Input */}
                        <div>
                            <InputLabel htmlFor="jenis" value="Jenis Produk" />
                            <TextInput
                                id="jenis"
                                type="text"
                                className="block w-full mt-1"
                                value={data.jenis}
                                onChange={(e) => setData('jenis', e.target.value)}
                                placeholder="Contoh: Voucher / Aksesoris"
                            />
                            <InputError message={errors.jenis} className="mt-2" />
                        </div>

                        {/* Stok (Hanya muncul jika TIDAK Digital) */}
                        <div>
                            {!data.is_digital ? (
                                <>
                                    <InputLabel htmlFor="stok" value="Stok Fisik" />
                                    <TextInput
                                        id="stok"
                                        type="number"
                                        className="block w-full mt-1"
                                        value={data.stok}
                                        onChange={(e) => setData('stok', e.target.value)}
                                    />
                                    <InputError message={errors.stok} className="mt-2" />
                                </>
                            ) : (
                                <div className="p-2 border border-dashed border-gray-300 rounded bg-gray-50 mt-1 h-[42px] flex items-center">
                                    <span className="text-xs text-gray-500">Stok: Unlimited (Digital)</span>
                                </div>
                            )}
                        </div>

                        {/* Harga Modal */}
                        <div>
                            <InputLabel
                                htmlFor="harga_modal"
                                value={data.is_flexible_price ? "Harga Modal (Dinonaktifkan)" : "Harga Modal"}
                            />
                            <TextInput
                                id="harga_modal"
                                type="number"
                                className={`block w-full mt-1 ${data.is_flexible_price ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                // Pastikan value tidak null/undefined supaya tidak error React
                                value={data.harga_modal ?? ''}
                                onChange={(e) => setData('harga_modal', e.target.value)}
                                disabled={data.is_flexible_price}
                                placeholder={data.is_flexible_price ? "Nominal diinput saat kasir" : "0"}
                            />
                            <InputError message={errors.harga_modal} className="mt-2" />
                        </div>

                        {/* Harga Jual */}
                        <div>
                            <InputLabel
                                htmlFor="harga_jual"
                                // Ubah label agar jelas
                                value={data.is_flexible_price ? "Biaya Admin / Margin (Rp)" : "Harga Jual"}
                            />
                            <TextInput
                                id="harga_jual"
                                type="number"
                                className="block w-full mt-1"
                                value={data.harga_jual}
                                onChange={(e) => setData('harga_jual', e.target.value)}
                                placeholder={data.is_flexible_price ? "Contoh: 2000 (Keuntungan)" : "0"}
                            />
                            <InputError message={errors.harga_jual} className="mt-2" />

                            {/* Helper text untuk flexible price */}
                            {data.is_flexible_price && (
                                <p className="mt-1 text-xs text-blue-600">
                                    * Isi dengan keuntungan yang ingin diambil. <br/>
                                    Contoh: Jika isi 2.000, dan kasir input nominal 50.000, total bayar jadi 52.000.
                                </p>
                            )}
                        </div>

                        {/* Is Digital Toggle */}
                        <div className="col-span-2 p-3 mt-2 border border-gray-200 rounded bg-gray-50">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded shadow-sm focus:ring-blue-500"
                                    checked={data.is_digital}
                                    onChange={(e) => setData('is_digital', e.target.checked)}
                                />
                                <div className="ms-3">
                                    <span className="block text-sm font-medium text-gray-900">
                                        Produk Digital
                                    </span>
                                    <span className="block text-xs text-gray-500">
                                        {data.is_digital
                                            ? "Centang ini untuk Pulsa/Token. Stok akan disembunyikan."
                                            : "Hapus centang untuk barang fisik. Stok wajib diisi."}
                                    </span>
                                </div>
                            </label>
                            <InputError message={errors.is_digital} className="mt-2" />
                        </div>
                        {data.is_digital && (
                            <div className="col-span-2 p-3 mt-2 border border-yellow-200 rounded bg-yellow-50">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded shadow-sm focus:ring-blue-500"
                                        checked={data.is_flexible_price}
                                        onChange={(e) => setData('is_flexible_price', e.target.checked)}
                                    />
                                    <div className="ms-3">
                                        <span className="block text-sm font-medium text-gray-900">
                                            Harga Fleksibel / Nominal Acak
                                        </span>
                                        <span className="block text-xs text-gray-500">
                                            {data.is_flexible_price
                                                ? "Aktif: Kasir akan diminta input Harga Modal & Jual saat transaksi (Cocok untuk Top Up E-Wallet)."
                                                : "Non-aktif: Kasir menggunakan harga fix dari database."}
                                        </span>
                                    </div>
                                </label>
                                {data.is_flexible_price && (
                                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-yellow-300">
                                        <div>
                                            <InputLabel htmlFor="min_nominal" value="Minimal Nominal (Opsional)" />
                                            <TextInput
                                                id="min_nominal"
                                                type="number"
                                                className="block w-full mt-1"
                                                value={data.min_nominal}
                                                onChange={(e) => setData('min_nominal', e.target.value)}
                                                placeholder="Contoh: 10000"
                                            />
                                            <InputError message={errors.min_nominal} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="max_nominal" value="Maksimal Nominal (Opsional)" />
                                            <TextInput
                                                id="max_nominal"
                                                type="number"
                                                className="block w-full mt-1"
                                                value={data.max_nominal}
                                                onChange={(e) => setData('max_nominal', e.target.value)}
                                                placeholder="Contoh: 1000000"
                                            />
                                            <InputError message={errors.max_nominal} className="mt-2" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {data.is_digital && (
                            <div className="col-span-2 p-3 mt-2 border border-green-200 rounded bg-green-50">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded shadow-sm focus:ring-blue-500"
                                        checked={data.is_tarik_tunai}
                                        onChange={(e) => setData('is_tarik_tunai', e.target.checked)}
                                    />
                                    <div className="ms-3">
                                        <span className="block text-sm font-medium text-gray-900">
                                            Jasa Tarik Tunai (Saldo Masuk)
                                        </span>
                                        <span className="block text-xs text-gray-500">
                                            Centang jika produk ini merupakan Jasa Tarik Tunai. Saldo provider akan bertambah sesuai nominal Modal.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={processing}>{isEditMode ? 'Simpan Perubahan' : 'Simpan'}</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
