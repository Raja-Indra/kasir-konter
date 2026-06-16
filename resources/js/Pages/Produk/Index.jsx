import { useState, useEffect, useCallback } from 'react';
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
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

const MySwal = withReactContent(Swal);

export default function ProdukIndex({ auth, products, providers }) {
    const { can } = usePermission();
    // State Tab (Default ke Digital)
    const [activeTab, setActiveTab] = useState('digital');
    const [searchKeyword, setSearchKeyword] = useState(''); // State Pencarian

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    // State Tambah Stok
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [productToAddStock, setProductToAddStock] = useState(null);
    const {
        data: stockData,
        setData: setStockData,
        post: postStock,
        processing: stockProcessing,
        errors: stockErrors,
        reset: resetStock,
        clearErrors: clearStockErrors
    } = useForm({ tambah_stok: '' });

    // State Inject Voucher
    const [isInjectModalOpen, setIsInjectModalOpen] = useState(false);
    const {
        data: injectData,
        setData: setInjectData,
        post: postInject,
        processing: injectProcessing,
        errors: injectErrors,
        reset: resetInject,
        clearErrors: clearInjectErrors
    } = useForm({
        provider_id: '',
        is_new_produk: false,
        produk_id: '',
        nama_produk: '',
        harga_jual: '',
        jenis: '',
        is_digital: false,
        qty: '',
        harga_modal_inject: '',
        harga_kertas_voucher: ''
    });

    const openInjectModal = () => {
        clearInjectErrors();
        setInjectData({
            provider_id: providers.length > 0 ? providers[0].id : '',
            is_new_produk: false,
            produk_id: '',
            nama_produk: '',
            harga_jual: '',
            jenis: '',
            is_digital: false,
            qty: '',
            harga_modal_inject: '',
            harga_kertas_voucher: ''
        });
        setIsInjectModalOpen(true);
    };

    const closeInjectModal = () => {
        setIsInjectModalOpen(false);
        resetInject();
    };

    const handleInjectSubmit = (e) => {
        e.preventDefault();
        MySwal.fire({
            title: 'Proses Inject Voucher?',
            text: `Saldo provider akan terpotong sejumlah Rp ${parseFloat((injectData.qty || 0) * (injectData.harga_modal_inject || 0)).toLocaleString('id-ID')}. Lanjutkan?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Inject',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                postInject(route('produk.inject'), {
                    onSuccess: () => {
                        closeInjectModal();
                        const Toast = Swal.mixin({
                            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
                        });
                        Toast.fire({ icon: 'success', title: 'Inject Voucher Berhasil!' });
                    },
                    onError: (err) => {
                        if(err.error) {
                            MySwal.fire('Gagal!', err.error, 'error');
                        }
                    }
                });
            }
        });
    };

    // Filter Data Berdasarkan Tab dan Pencarian
    const filteredProducts = products.filter(product => {
        let matchTab = false;
        if (activeTab === 'arsip') {
            matchTab = product.is_archived;
        } else {
            if (product.is_archived) return false;
            matchTab = activeTab === 'digital' ? product.is_digital : !product.is_digital;
        }

        const matchSearch = product.nama_produk.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                            (product.provider && product.provider.nama_provider.toLowerCase().includes(searchKeyword.toLowerCase()));
        return matchTab && matchSearch;
    });

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        provider_id: '',
        nama_produk: '',
        foto: null,
        remove_foto: false,
        harga_admin_provider: '',
        harga_modal: '',
        harga_jual: '',
        min_nominal: '',
        max_nominal: '',
        stok: 0,
        jenis: '',
        is_digital: true,
        is_tarik_tunai: false,
        is_flexible_price: false,
        _method: 'post', // Default method
    });

    // Cropper State
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImageFile = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                0
            );
            setData('foto', croppedImageFile);
            setIsCropModalOpen(false);
            setImageSrc(null);
        } catch (e) {
            console.error(e);
        }
    }, [imageSrc, croppedAreaPixels]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setIsCropModalOpen(true);
            });
            // Reset input file value so the same file can be selected again if canceled
            e.target.value = null;
        }
    };

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
            is_digital: activeTab === 'digital',
            remove_foto: false,
            _method: 'post'
        }));

        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setIsEditMode(true);
        setProductToEdit(item);
        setData({
            provider_id: item.provider_id,
            nama_produk: item.nama_produk,
            foto: null, // Reset input file saat edit
            remove_foto: false,
            harga_admin_provider: item.harga_admin_provider || '',
            harga_modal: item.harga_modal,
            harga_jual: item.harga_jual,
            min_nominal: item.min_nominal || '',
            max_nominal: item.max_nominal || '',
            stok: item.stok,
            jenis: item.jenis,
            is_digital: item.is_digital ? true : false,
            is_tarik_tunai: item.is_tarik_tunai ? true : false,
            is_flexible_price: item.is_flexible_price ? true : false,
            _method: 'put' // Paksa method PUT agar support FormData file upload di Laravel
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const openAddStockModal = (product) => {
        setProductToAddStock(product);
        resetStock();
        clearStockErrors();
        setIsAddStockModalOpen(true);
    };

    const closeAddStockModal = () => {
        setIsAddStockModalOpen(false);
        resetStock();
    };

    const handleAddStockSubmit = (e) => {
        e.preventDefault();
        MySwal.fire({
            title: 'Tambah Stok?',
            text: `Tambahkan stok sebanyak ${stockData.tambah_stok} untuk ${productToAddStock.nama_produk}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Tambah',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                postStock(route('produk.add_stock', productToAddStock.id), {
                    onSuccess: () => {
                        closeAddStockModal();
                        const Toast = Swal.mixin({
                            toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
                        });
                        Toast.fire({ icon: 'success', title: 'Stok berhasil ditambahkan' });
                    },
                });
            }
        });
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

                // Form submission
                if (isEditMode) {
                    post(route('produk.update', productToEdit.id), options);
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
                        MySwal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Produk berhasil dihapus', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    }
                });
            }
        });
    };

    const handleArchive = (product) => {
        const actionText = product.is_archived ? 'mengembalikan' : 'mengarsipkan';
        const confirmBtnColor = product.is_archived ? '#3085d6' : '#d33';
        MySwal.fire({
            title: `${product.is_archived ? 'Kembalikan' : 'Arsipkan'} Produk?`,
            text: `Produk yang diarsipkan tidak akan muncul di kasir. Anda yakin ingin ${actionText} produk ini?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: confirmBtnColor,
            cancelButtonColor: '#aaa',
            confirmButtonText: `Ya, ${product.is_archived ? 'kembalikan' : 'arsipkan'}!`,
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(route('produk.archive', product.id), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        MySwal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Produk berhasil ${product.is_archived ? 'dikembalikan' : 'diarsipkan'}`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
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
                                {can('create products') && (
                                    <div className="flex gap-2">
                                        <PrimaryButton className="!bg-white !text-blue-800 hover:!bg-gray-100" onClick={openCreateModal}>+ Tambah Produk</PrimaryButton>
                                        <PrimaryButton className="!bg-yellow-400 !text-blue-900 hover:!bg-yellow-500" onClick={openInjectModal}>💉 Inject Voucher</PrimaryButton>
                                    </div>
                                )}
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
                                        {products.filter(p => p.is_digital && !p.is_archived).length}
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
                                        {products.filter(p => !p.is_digital && !p.is_archived).length}
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab('arsip')}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                        ${activeTab === 'arsip'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    🗄️ Arsip
                                    <span className="ml-2 bg-orange-100 text-orange-600 py-0.5 px-2.5 rounded-full text-xs">
                                        {products.filter(p => p.is_archived).length}
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
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Foto</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Provider</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Nama Produk</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Jenis</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Modal</th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Jual</th>

                                        {/* Kolom Stok Dinamis (Hanya muncul jika tab Fisik, atau label lain jika Digital) */}
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                                            {activeTab === 'digital' ? 'Status' : (activeTab === 'fisik' ? 'Sisa Stok' : 'Status / Stok')}
                                        </th>

                                        { (can('edit products') || can('delete products')) && (
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">Aksi</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {item.foto ? (
                                                        <img src={`/storage/${item.foto}`} alt={item.nama_produk} className="object-cover w-12 h-12 rounded shadow" />
                                                    ) : (
                                                        <span className="text-gray-400 italic">No image</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-blue-600">
                                                    {item.provider ? item.provider.nama_provider : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                    <div className="flex items-center space-x-2">
                                                        <span>{item.nama_produk}</span>
                                                        {item.is_archived && (
                                                            <span className="px-2 py-0.5 text-xs font-semibold text-white bg-orange-500 rounded-full">Diarsipkan</span>
                                                        )}
                                                    </div>
                                                    {item.is_flexible_price && (item.min_nominal || item.max_nominal) && (
                                                        <div className="mt-1 text-[11px] font-normal text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded border border-blue-100">
                                                            Range: {item.min_nominal ? `Rp ${parseFloat(item.min_nominal).toLocaleString('id-ID')}` : '0'} - {item.max_nominal ? `Rp ${parseFloat(item.max_nominal).toLocaleString('id-ID')}` : '∞'}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_digital ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                                        {item.jenis}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    Rp {parseFloat(parseFloat(item.harga_modal) + (parseFloat(item.harga_admin_provider) || 0)).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-green-600">Rp {parseFloat(item.harga_jual).toLocaleString('id-ID')}</td>

                                                <td className="px-6 py-4 text-sm text-center">
                                                    {item.is_digital ? (
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

                                                { (can('edit products') || can('delete products')) && (
                                                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                        {!item.is_digital && can('edit products') && (
                                                            <button onClick={() => openAddStockModal(item)} className="mr-4 text-green-600 transition hover:text-green-900">Tambah Stok</button>
                                                        )}
                                                        {can('edit products') && (
                                                            <button onClick={() => openEditModal(item)} className="mr-4 text-blue-600 transition hover:text-blue-900">Edit</button>
                                                        )}
                                                        {can('edit products') && (
                                                            <button onClick={() => handleArchive(item)} className={`mr-4 transition ${item.is_archived ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'}`}>
                                                                {item.is_archived ? 'Kembalikan' : 'Arsipkan'}
                                                            </button>
                                                        )}
                                                        {can('delete products') && (
                                                            <button onClick={() => handleDelete(item.id)} className="text-red-600 transition hover:text-red-900">Hapus</button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="9" className="px-6 py-10 italic text-center text-gray-500">
                                            Tidak ada data untuk {activeTab === 'arsip' ? 'Arsip' : (activeTab === 'digital' ? 'Produk Digital' : 'Produk Fisik')}.
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL FORM */}
            <Modal show={isModalOpen} onClose={() => {
                if (!isCropModalOpen) closeModal();
            }}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        {isEditMode ? 'Edit Produk' : `Tambah Produk ${activeTab === 'arsip' ? '' : (activeTab === 'digital' ? 'Digital' : 'Fisik')}`}
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Foto Produk */}
                        <div className="col-span-2">
                            <InputLabel htmlFor="foto" value="Foto Produk (Opsional)" />
                            {isEditMode && productToEdit?.foto && !data.remove_foto && (
                                <div className="mb-2">
                                    <span className="block text-xs text-gray-500 mb-1">Foto saat ini:</span>
                                    <div className="flex items-center gap-4">
                                        <img src={`/storage/${productToEdit.foto}`} alt="Preview" className="h-20 w-20 object-cover rounded shadow" />
                                        <div className="flex flex-col gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageSrc(`/storage/${productToEdit.foto}`);
                                                    setIsCropModalOpen(true);
                                                }}
                                                className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                                            >
                                                Edit Foto
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('remove_foto', true)}
                                                className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded hover:bg-red-200"
                                            >
                                                Hapus Foto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {data.remove_foto && (
                                <div className="mb-2 p-2 text-sm text-yellow-700 bg-yellow-100 rounded">
                                    Foto akan dihapus saat disimpan.
                                    <button
                                        type="button"
                                        onClick={() => setData('remove_foto', false)}
                                        className="ml-2 text-blue-600 underline hover:text-blue-800"
                                    >
                                        Batal Hapus
                                    </button>
                                </div>
                            )}
                            {data.foto && typeof data.foto !== 'string' && (
                                <div className="mb-2">
                                    <span className="block text-xs text-gray-500 mb-1">Foto Baru (Akan diupload):</span>
                                    <img src={URL.createObjectURL(data.foto)} alt="New Preview" className="h-20 w-20 object-cover rounded shadow" />
                                </div>
                            )}
                            <input
                                id="foto"
                                type="file"
                                accept="image/*"
                                className="block w-full mt-1 text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
                                onChange={handleFileChange}
                            />
                            <InputError message={errors.foto} className="mt-2" />
                        </div>

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
                        {!data.is_digital && (
                            <div>
                                <InputLabel htmlFor="stok" value="Stok Fisik" />
                                <TextInput
                                    id="stok"
                                    type="number"
                                    className="block w-full mt-1"
                                    value={data.stok}
                                    onChange={(e) => setData('stok', e.target.value)}
                                />
                                <InputError message={errors.stok} className="mt-2" />
                            </div>
                        )}

                        {/* Harga Admin Provider */}
                        {data.is_digital && (
                            <div>
                                <InputLabel
                                    htmlFor="harga_admin_provider"
                                    value="Harga Admin Provider (Opsional)"
                                />
                                <TextInput
                                    id="harga_admin_provider"
                                    type="number"
                                    className="block w-full mt-1"
                                    value={data.harga_admin_provider ?? ''}
                                    onChange={(e) => setData('harga_admin_provider', e.target.value)}
                                    placeholder="Contoh: 150"
                                />
                                <InputError message={errors.harga_admin_provider} className="mt-2" />
                            </div>
                        )}

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

            {/* MODAL TAMBAH STOK */}
            <Modal show={isAddStockModalOpen} onClose={closeAddStockModal}>
                <form onSubmit={handleAddStockSubmit} className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        Tambah Stok untuk {productToAddStock?.nama_produk}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="tambah_stok" value="Jumlah Tambahan Stok" />
                        <TextInput
                            id="tambah_stok"
                            type="number"
                            className="block w-full mt-1"
                            value={stockData.tambah_stok}
                            onChange={(e) => setStockData('tambah_stok', e.target.value)}
                            isFocused
                            placeholder="Contoh: 10"
                        />
                        <InputError message={stockErrors.tambah_stok} className="mt-2" />
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={closeAddStockModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ms-3" disabled={stockProcessing}>
                            Tambah Stok
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL INJECT VOUCHER */}
            <Modal show={isInjectModalOpen} onClose={closeInjectModal} maxWidth="2xl">
                <form onSubmit={handleInjectSubmit} className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        💉 Inject Voucher Kosong
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Pilih Provider */}
                        <div className="col-span-2">
                            <InputLabel htmlFor="inject_provider_id" value="Provider" />
                            <select
                                id="inject_provider_id"
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={injectData.provider_id}
                                onChange={(e) => {
                                    setInjectData(data => ({
                                        ...data,
                                        provider_id: e.target.value,
                                        produk_id: ''
                                    }));
                                }}
                            >
                                <option value="">-- Pilih Provider --</option>
                                {providers.map((prov) => (
                                    <option key={prov.id} value={prov.id}>{prov.nama_provider}</option>
                                ))}
                            </select>
                            <InputError message={injectErrors.provider_id} className="mt-2" />
                            
                            {/* Saldo Info */}
                            {injectData.provider_id && (
                                <div className="mt-1 text-sm text-gray-600">
                                    Sisa Saldo: <span className="font-bold text-blue-600">Rp {parseFloat(providers.find(p => p.id == injectData.provider_id)?.saldo || 0).toLocaleString('id-ID')}</span>
                                </div>
                            )}
                        </div>

                        {/* Toggle Jenis Produk */}
                        <div className="col-span-2 p-3 mt-2 border border-gray-200 rounded bg-gray-50">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded shadow-sm focus:ring-blue-500"
                                    checked={injectData.is_new_produk}
                                    onChange={(e) => setInjectData('is_new_produk', e.target.checked)}
                                />
                                <div className="ms-3">
                                    <span className="block text-sm font-medium text-gray-900">
                                        Buat Produk Baru
                                    </span>
                                    <span className="block text-xs text-gray-500">
                                        Centang jika Anda meng-inject jenis voucher yang belum ada di daftar produk.
                                    </span>
                                </div>
                            </label>
                            <InputError message={injectErrors.is_new_produk} className="mt-2" />
                        </div>

                        {!injectData.is_new_produk ? (
                            // Pilih Produk Lama
                            <div className="col-span-2">
                                <InputLabel htmlFor="inject_produk_id" value="Pilih Produk" />
                                <select
                                    id="inject_produk_id"
                                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={injectData.produk_id}
                                    onChange={(e) => setInjectData('produk_id', e.target.value)}
                                >
                                    <option value="">-- Pilih Produk Fisik --</option>
                                    {products.filter(p => p.provider_id == injectData.provider_id && !p.is_digital && !p.is_flexible_price).map((prod) => (
                                        <option key={prod.id} value={prod.id}>{prod.nama_produk} (Sisa: {prod.stok})</option>
                                    ))}
                                </select>
                                <InputError message={injectErrors.produk_id} className="mt-2" />
                            </div>
                        ) : (
                            // Input Produk Baru
                            <>
                                <div className="col-span-2">
                                    <InputLabel htmlFor="inject_nama_produk" value="Nama Produk Baru" />
                                    <TextInput
                                        id="inject_nama_produk"
                                        type="text"
                                        className="block w-full mt-1"
                                        value={injectData.nama_produk}
                                        onChange={(e) => setInjectData('nama_produk', e.target.value)}
                                        placeholder="Contoh: Voucher Fisik Telkomsel 2GB"
                                    />
                                    <InputError message={injectErrors.nama_produk} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="inject_jenis" value="Jenis Produk" />
                                    <TextInput
                                        id="inject_jenis"
                                        type="text"
                                        className="block w-full mt-1"
                                        value={injectData.jenis}
                                        onChange={(e) => setInjectData('jenis', e.target.value)}
                                        placeholder="Contoh: Voucher"
                                    />
                                    <InputError message={injectErrors.jenis} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="inject_harga_jual" value="Harga Jual (Rp)" />
                                    <TextInput
                                        id="inject_harga_jual"
                                        type="number"
                                        className="block w-full mt-1"
                                        value={injectData.harga_jual}
                                        onChange={(e) => setInjectData('harga_jual', e.target.value)}
                                        placeholder="Contoh: 15000"
                                    />
                                    <InputError message={injectErrors.harga_jual} className="mt-2" />
                                </div>
                            </>
                        )}

                        <div className="col-span-2 mt-4"><hr /></div>

                        {/* Input Inject Details */}
                        <div>
                            <InputLabel htmlFor="inject_harga_modal_inject" value="Harga Modal Inject per Pcs (Memotong Saldo)" />
                            <TextInput
                                id="inject_harga_modal_inject"
                                type="number"
                                className="block w-full mt-1"
                                value={injectData.harga_modal_inject}
                                onChange={(e) => setInjectData('harga_modal_inject', e.target.value)}
                                placeholder="Contoh: 10000"
                            />
                            <InputError message={injectErrors.harga_modal_inject} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="inject_harga_kertas_voucher" value="Harga Kertas Kosong per Pcs" />
                            <TextInput
                                id="inject_harga_kertas_voucher"
                                type="number"
                                className="block w-full mt-1"
                                value={injectData.harga_kertas_voucher}
                                onChange={(e) => setInjectData('harga_kertas_voucher', e.target.value)}
                                placeholder="Contoh: 500"
                            />
                            <InputError message={injectErrors.harga_kertas_voucher} className="mt-2" />
                        </div>
                        <div className="col-span-2">
                            <InputLabel htmlFor="inject_qty" value="Jumlah Voucher Kosong (Qty)" />
                            <TextInput
                                id="inject_qty"
                                type="number"
                                className="block w-full mt-1"
                                value={injectData.qty}
                                onChange={(e) => setInjectData('qty', e.target.value)}
                                placeholder="Contoh: 10"
                            />
                            <InputError message={injectErrors.qty} className="mt-2" />
                        </div>
                    </div>
                    
                    {/* Kalkulasi Summary */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Total Potong Saldo:</span>
                            <span className="font-bold text-red-600">
                                Rp {parseFloat((injectData.qty || 0) * (injectData.harga_modal_inject || 0)).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">Harga Modal Baru Produk:</span>
                            <span className="font-bold text-green-600">
                                Rp {parseFloat((parseFloat(injectData.harga_modal_inject) || 0) + (parseFloat(injectData.harga_kertas_voucher) || 0)).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <SecondaryButton onClick={closeInjectModal}>Batal</SecondaryButton>
                        <PrimaryButton className="ms-3 !bg-yellow-500 hover:!bg-yellow-600 text-white" disabled={injectProcessing}>
                            Inject Sekarang
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Crop Gambar */}
            <Modal show={isCropModalOpen} onClose={() => setIsCropModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Crop Gambar</h2>
                    <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                minZoom={0.1}
                                restrictPosition={false}
                                aspect={1} // Square aspect ratio
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        )}
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                        <label className="text-sm text-gray-600 w-16">Zoom</label>
                        <input
                            type="range"
                            value={zoom}
                            min={0.1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => {
                                setZoom(e.target.value);
                            }}
                            className="w-full"
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={(e) => {
                            e.preventDefault();
                            setIsCropModalOpen(false);
                            setImageSrc(null);
                        }}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton type="button" onClick={(e) => {
                            e.preventDefault();
                            showCroppedImage();
                        }}>
                            Potong & Simpan
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}