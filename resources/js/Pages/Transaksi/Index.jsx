import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function TransaksiIndex({ auth, products, pelangganHutang }) {
    // --- STATE ---
    const { errors } = usePage().props;
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'fisik', 'digital'
    const [cart, setCart] = useState([]);
    const [bayar, setBayar] = useState('');
    const [umur, setUmur] = useState('');
    const [metodePembayaran, setMetodePembayaran] = useState('tunai'); // 'tunai' atau 'hutang'
    const [namaPelanggan, setNamaPelanggan] = useState('');

    // --- HELPER: Format Rupiah ---
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // --- LOGIC 1: Filter Produk (Search & Tab) ---
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchSearch = product.nama_produk.toLowerCase().includes(keyword.toLowerCase());

            let matchTab = true;
            if (activeTab === 'fisik') matchTab = !product.is_digital;
            if (activeTab === 'digital') matchTab = product.is_digital;

            return matchSearch && matchTab;
        });
    }, [products, keyword, activeTab]);

    // --- LOGIC 2: Masukkan ke Keranjang ---
    // --- LOGIC 2: Masukkan ke Keranjang ---
    const addToCart = async (product) => {

        // Cek Stok Fisik
        if (!product.is_digital && product.stok <= 0) {
            MySwal.fire({ icon: 'error', title: 'Stok Habis!', timer: 1500, showConfirmButton: false });
            return;
        }

        let finalModal = parseFloat(product.harga_modal) + (parseFloat(product.harga_admin_provider) || 0);
        let finalJual = parseFloat(product.harga_jual);

        // --- LOGIKA HARGA FLEKSIBEL (POPUP UPDATE) ---
        if (product.is_flexible_price) {
            // Kita ambil Biaya Admin dari database (yang disimpan di kolom harga_jual)
            const biayaAdmin = parseFloat(product.harga_jual);
            const minText = product.min_nominal ? `<br/>Min Nominal: <b>${formatRupiah(product.min_nominal)}</b>` : '';
            const maxText = product.max_nominal ? `<br/>Max Nominal: <b>${formatRupiah(product.max_nominal)}</b>` : '';

            const titleText = product.is_tarik_tunai ? 'Input Nominal Tarik Tunai' : 'Input Nominal Top Up';
            const labelText = product.is_tarik_tunai ? 'Nominal Penarikan' : 'Nominal Pengisian';

            const { value: nominalInput } = await MySwal.fire({
                title: titleText,
                html:
                    `<p class="text-sm text-gray-600 mb-4">Biaya Admin: <b>${formatRupiah(biayaAdmin)}</b>${minText}${maxText}</p>` +
                    `<label class="block text-left text-sm mb-1 font-bold">${labelText}</label>` +
                    '<input id="swal-nominal" type="number" class="swal2-input" placeholder="Contoh: 50000" autofocus>',
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Lanjut',
                preConfirm: () => {
                    return document.getElementById('swal-nominal').value
                }
            });

            if (!nominalInput) return; // Jika di-cancel atau kosong

            const nominal = parseFloat(nominalInput);

            // VALIDASI MIN & MAX NOMINAL
            if (product.min_nominal && nominal < parseFloat(product.min_nominal)) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Nominal Terlalu Kecil',
                    text: `Minimal nominal untuk produk ini adalah ${formatRupiah(product.min_nominal)}`,
                });
                return;
            }

            if (product.max_nominal && nominal > parseFloat(product.max_nominal)) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Nominal Terlalu Besar',
                    text: `Maksimal nominal untuk produk ini adalah ${formatRupiah(product.max_nominal)}`,
                });
                return;
            }

            // RUMUS UTAMA:
            // Harga Modal = Nominal yang diinput (Saldo provider terpotong segini) + Harga Admin Provider
            // Harga Jual  = Nominal + Biaya Admin + Harga Admin Provider
            finalModal = nominal + (parseFloat(product.harga_admin_provider) || 0);
            finalJual  = nominal + biayaAdmin + (parseFloat(product.harga_admin_provider) || 0);

            // Konfirmasi Akhir ke Kasir (Opsional, biar gak salah input)
            const confirm = await MySwal.fire({
                title: 'Konfirmasi',
                html: `
                    <div class="text-left text-sm">
                        <p>Nominal: <b>${formatRupiah(nominal)}</b></p>
                        <p>Admin Provider: <b>${formatRupiah(parseFloat(product.harga_admin_provider) || 0)}</b></p>
                        <p>Biaya Admin (Margin): <b>${formatRupiah(biayaAdmin)}</b></p>
                        <hr class="my-2"/>
                        <p class="text-lg">Total Tagihan: <b class="text-blue-600">${formatRupiah(finalJual)}</b></p>
                    </div>
                `,
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Masuk Keranjang'
            });

            if (!confirm.isConfirmed) return;
        }
        // ---------------------------------------------

        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            // Khusus produk flexible, biasanya kita tidak gabung itemnya karena harganya bisa beda-beda
            // Tapi untuk simplifikasi, jika flexible price, kita tambahkan sebagai item BARU di array (tidak di-merge)
            if (product.is_flexible_price) {
                setCart([...cart, {
                    ...product,
                    // Tambahkan ID unik sementara agar tidak tertumpuk
                    cartId: Date.now(),
                    qty: 1,
                    harga_modal: finalModal,
                    harga_jual: finalJual
                }]);
                return;
            }

            // Logika merge produk biasa
            if (!product.is_digital && existingItem.qty >= product.stok) {
                MySwal.fire({ icon: 'warning', title: 'Stok Habis', timer: 1500, showConfirmButton: false });
                return;
            }

            setCart(cart.map(item =>
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, {
                ...product,
                qty: 1,
                harga_modal: finalModal, // Pakai harga yang sudah ditentukan (bisa fix atau inputan)
                harga_jual: finalJual
            }]);
        }
    };

    // --- LOGIC 3: Update Qty di Keranjang ---
    const updateQty = (id, newQty) => {
        if (newQty < 1) return;

        const productAsli = products.find(p => p.id === id);

        // Cek stok fisik
        if (!productAsli.is_digital && newQty > productAsli.stok) {
            MySwal.fire({ icon: 'warning', title: 'Stok Habis', timer: 1000, showConfirmButton: false });
            return;
        }

        setCart(cart.map(item => item.id === id ? { ...item, qty: newQty } : item));
    };

    // --- LOGIC 4: Hapus Item ---
    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    // --- HITUNGAN TOTAL ---
    const totalHarga = cart.reduce((acc, item) => acc + (item.harga_jual * item.qty), 0);
    const hasTarikTunai = cart.some(item => item.is_tarik_tunai);
    const kembalian = hasTarikTunai ? 0 : ((parseFloat(bayar) || 0) - totalHarga);

    // --- LOGIC 5: Submit Transaksi ---
    const handleCheckout = () => {
        if (cart.length === 0) return MySwal.fire('Keranjang Kosong', 'Pilih produk dulu', 'warning');
        
        const bayarNominal = hasTarikTunai ? totalHarga : (parseFloat(bayar) || 0);

        if (!hasTarikTunai && metodePembayaran === 'tunai' && bayarNominal < totalHarga) {
            return MySwal.fire('Uang Kurang', 'Nominal pembayaran kurang dari total belanja', 'error');
        }

        if (metodePembayaran === 'hutang' && !namaPelanggan.trim()) {
            return MySwal.fire('Nama Pelanggan Wajib', 'Masukkan nama pelanggan untuk catatan hutang', 'warning');
        }

        MySwal.fire({
            title: 'Proses Transaksi?',
            text: `Total: ${formatRupiah(totalHarga)}${metodePembayaran === 'hutang' ? ` | Hutang: ${formatRupiah(totalHarga - bayarNominal)}` : ''}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Bayar',
            confirmButtonColor: '#10B981'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('transaksi.store'), {
                    cart: cart,
                    total_harga: totalHarga,
                    bayar: bayarNominal,
                    umur_pelanggan: umur,
                    metode_pembayaran: metodePembayaran,
                    nama_pelanggan: namaPelanggan
                }, {
                    onSuccess: () => {
                        setCart([]);
                        setBayar('');
                        setUmur('');
                        setMetodePembayaran('tunai');
                        setNamaPelanggan('');
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true
                        });
                        Toast.fire({
                            icon: 'success',
                            title: 'Transaksi berhasil'
                        });
                    },
                    onError: (errors) => {
                        const firstError = Object.values(errors)[0];
                        MySwal.fire('Gagal', errors.error || firstError || 'Terjadi kesalahan sistem', 'error');
                    }
                });
            }
        });
    };

    // --- LOGIC PIN PRODUK ---
    const handlePin = (e, product) => {
        e.stopPropagation(); // PENTING: Agar tidak memicu addToCart saat klik pin

        router.put(route('produk.pin', product.id), {}, {
            preserveScroll: true, // Agar scroll tidak loncat ke atas
            onSuccess: () => {
                const status = !product.is_pinned ? 'dipin' : 'dilepas pin-nya';
                // Opsional: Tampilkan notifikasi kecil
                // MySwal.fire({
                //     toast: true, position: 'top-end', icon: 'success',
                //     title: `Produk ${status}`, showConfirmButton: false, timer: 1500
                // });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kasir" />

            {/* FIX 1: Main Container
               h-[calc(100vh-125px)] -> Tinggi layar dikurangi tinggi Navbar dan Footer
               overflow-hidden -> Mencegah scroll pada window browser utama
            */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-125px)] overflow-hidden bg-gray-100">

                {/* --- KIRI: KATALOG (70%) --- */}
                <div className="flex flex-col flex-1 h-full overflow-hidden border-r border-gray-200">

                    {/* Header Katalog (Search & Filter) - Tidak ikut scroll */}
                    <div className="z-10 flex-shrink-0 p-4 bg-white shadow-sm">
                        <div className="flex gap-2 mb-3">
                            <div className="relative w-full">
                                <TextInput
                                    className="w-full pl-10"
                                    placeholder="Cari nama produk..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    autoFocus
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex pb-1 space-x-2 overflow-x-auto no-scrollbar">
                            {['all', 'fisik', 'digital'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition ${
                                        activeTab === tab ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {tab === 'all' ? 'Semua' : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid Produk - Area ini SAJA yang bisa di-scroll */}
                    <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-gray-100">
                        <div className="grid grid-cols-2 gap-3 pb-2 md:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className={`
                                        bg-white p-3 rounded-xl shadow-sm cursor-pointer transition transform active:scale-95 border border-transparent hover:border-blue-500 relative overflow-hidden group h-full flex flex-col justify-between
                                        ${product.stok <= 0 && !product.is_digital ? 'opacity-60 pointer-events-none grayscale' : ''}
                                        ${product.is_pinned ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}
                                    `} // ^ Tambahkan highlight kuning tipis jika dipin
                                >
                                    {/* --- BADGE KANAN (TIPE) --- */}
                                    <span className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold uppercase rounded-bl-lg ${product.is_digital ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'}`}>
                                        {product.is_digital ? 'Digital' : 'Fisik'}
                                    </span>

                                    {/* --- TOMBOL PIN KIRI (BARU) --- */}
                                    <button
                                        onClick={(e) => handlePin(e, product)}
                                        className={`
                                            absolute top-0 left-0 p-1.5 rounded-br-lg transition-colors z-20
                                            ${product.is_pinned
                                                ? 'bg-yellow-400 text-white hover:bg-yellow-500'
                                                : 'bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-600'}
                                        `}
                                        title={product.is_pinned ? "Lepas Pin" : "Pin Produk"}
                                    >
                                        {/* Icon Pin */}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    <div className="mt-6 mb-2"> {/* Margin top diperbesar dikit biar ga nabrak pin */}
                                        <div className="flex flex-col items-center justify-center h-24 mb-2 overflow-hidden bg-gray-100 rounded-lg">
                                            {product.foto ? (
                                                <img src={`/storage/${product.foto}`} alt={product.nama_produk} className="object-cover w-full h-full" />
                                            ) : (
                                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold leading-tight text-gray-800 line-clamp-2">{product.nama_produk}</h3>
                                        {product.provider && (
                                            <p className="mt-1 text-[10px] font-semibold text-blue-600 uppercase">{product.provider.nama_provider}</p>
                                        )}
                                        {product.jenis && (
                                            <p className="mt-1 text-[10px] text-gray-500 uppercase">{product.jenis}</p>
                                        )}
                                    </div>

                                    {/* ... Sisa kode harga dan stok (biarkan sama) ... */}
                                    <div className="flex items-end justify-between pt-2 mt-auto border-t">
                                        <div>
                                            <p className="text-[10px] text-gray-500">
                                                {product.is_flexible_price ? 'Range Nominal' : 'Harga'}
                                            </p>
                                            {product.is_flexible_price && (product.min_nominal || product.max_nominal) ? (
                                                <p className="text-xs font-bold text-blue-600">
                                                    {product.min_nominal ? `Rp${parseFloat(product.min_nominal).toLocaleString('id-ID')}` : '0'} - {product.max_nominal ? `Rp${parseFloat(product.max_nominal).toLocaleString('id-ID')}` : '∞'}
                                                </p>
                                            ) : (
                                                <p className="text-sm font-bold text-blue-600">{formatRupiah(product.harga_jual)}</p>
                                            )}
                                            {product.is_flexible_price && (
                                                <div className="mt-1 text-[10px] font-medium text-orange-600 bg-orange-50 inline-block px-1.5 py-0.5 rounded border border-orange-100">
                                                    Admin: {formatRupiah(product.harga_jual)}
                                                </div>
                                            )}
                                        </div>
                                        {!product.is_digital ? (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${product.stok <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                Stok: {product.stok}
                                            </span>
                                        ) : (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${product.provider && product.provider.saldo <= 50000 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`} title={product.provider ? product.provider.nama_provider : ''}>
                                                Saldo: {product.provider ? formatRupiah(product.provider.saldo) : 'Rp 0'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <p>Produk tidak ditemukan.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- KANAN: KERANJANG (30%) --- */}
                {/* flex-col h-full memastikan dia mengisi tinggi penuh */}
                <div className="w-full lg:w-[400px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl z-20">

                    {/* 1. Header Keranjang (Fixed) */}
                    <div className="flex items-center justify-between flex-shrink-0 p-4 text-white bg-gradient-to-r from-blue-800 to-blue-500 shadow-md">
                        <h2 className="flex items-center text-lg font-bold">
                            <span>🛒 Keranjang</span>
                        </h2>
                        <span className="px-2 py-1 text-xs font-bold text-blue-800 bg-white rounded-full">{cart.length} Item</span>
                    </div>

                    {/* 2. List Item (Flexible & Scrollable) */}
                    {/* min-h-0 sangat penting agar scroll berfungsi di dalam flex container */}
                    <div className="flex-1 min-h-0 p-4 space-y-3 overflow-y-auto bg-gray-50">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                <p className="text-sm">Keranjang kosong</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.cartId || item.id} className="flex flex-col p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="w-3/4 text-sm font-bold leading-snug text-gray-800 line-clamp-2">{item.nama_produk}</h4>
                                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-gray-400 transition hover:text-red-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-blue-600">{formatRupiah(item.harga_jual)}</p>
                                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="flex items-center justify-center text-lg font-bold leading-none text-gray-600 bg-white rounded shadow-sm w-7 h-7 hover:text-blue-600 disabled:opacity-50" disabled={item.qty <= 1}>-</button>
                                            <input type="text" readOnly value={item.qty} className="w-10 p-0 text-sm font-bold text-center text-gray-700 bg-transparent border-none focus:ring-0" />
                                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="flex items-center justify-center text-lg font-bold leading-none text-gray-600 bg-white rounded shadow-sm w-7 h-7 hover:text-blue-600">+</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* 3. Footer Checkout (Fixed at Bottom) */}
                    {/* flex-shrink-0 MENCEGAH footer tergencet */}
                    <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30 flex-shrink-0">
                        {/* Total */}
                        <div className="flex items-end justify-between mb-3">
                            <span className="text-sm font-medium text-gray-500">Total Tagihan</span>
                            <span className="text-2xl font-extrabold text-gray-900">{formatRupiah(totalHarga)}</span>
                        </div>

                        {/* Pilihan Metode Pembayaran */}
                        <div className="flex space-x-2 mb-3">
                            <button
                                className={`flex-1 py-2 text-sm font-bold rounded-lg border ${metodePembayaran === 'tunai' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-300'}`}
                                onClick={() => setMetodePembayaran('tunai')}
                            >
                                Tunai
                            </button>
                            <button
                                className={`flex-1 py-2 text-sm font-bold rounded-lg border ${metodePembayaran === 'hutang' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-600 border-gray-300'}`}
                                onClick={() => setMetodePembayaran('hutang')}
                            >
                                Hutang
                            </button>
                        </div>

                        {/* Input Area */}
                        {metodePembayaran === 'hutang' && (
                            <div className="mb-3">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nama Pelanggan (Wajib)</label>
                                <TextInput
                                    type="text"
                                    className="w-full h-10 text-sm"
                                    placeholder="Nama penghutang..."
                                    value={namaPelanggan}
                                    onChange={(e) => setNamaPelanggan(e.target.value)}
                                    list="pelanggan-list"
                                    autoComplete="off"
                                />
                                <datalist id="pelanggan-list">
                                    {pelangganHutang && pelangganHutang.map((p, index) => (
                                        <option key={index} value={p.nama_pelanggan} />
                                    ))}
                                </datalist>
                                {namaPelanggan && pelangganHutang?.find(p => p.nama_pelanggan.toLowerCase() === namaPelanggan.trim().toLowerCase()) && (
                                    <p className="mt-1 text-xs font-semibold text-orange-600">
                                        Sisa Hutang Sebelumnya: {formatRupiah(pelangganHutang.find(p => p.nama_pelanggan.toLowerCase() === namaPelanggan.trim().toLowerCase()).sisa)}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-12 gap-2 mb-3">
                            <div className="col-span-8">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                    {metodePembayaran === 'hutang' ? 'Bayar / DP (Rp)' : 'Bayar (Rp)'}
                                </label>
                                <TextInput
                                    type="text"
                                    inputMode="numeric"
                                    className={`w-full h-10 font-mono text-lg font-bold text-right ${hasTarikTunai ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                    placeholder="0"
                                    value={hasTarikTunai ? totalHarga : bayar}
                                    onChange={(e) => setBayar(e.target.value.replace(/[^0-9]/g, ''))}
                                    disabled={hasTarikTunai}
                                />
                            </div>
                            <div className="col-span-4">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Umur</label>
                                <TextInput
                                    type="number"
                                    className="w-full h-10 text-center"
                                    placeholder="-"
                                    value={umur}
                                    onChange={(e) => setUmur(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Kembalian Info */}
                        <div className={`flex justify-between items-center px-3 py-1.5 rounded-lg mb-3 transition-colors ${kembalian >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <span className={`text-xs font-bold uppercase ${kembalian >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {metodePembayaran === 'hutang' && kembalian < 0 ? 'Hutang' : (kembalian >= 0 ? 'Kembalian' : 'Kurang')}
                            </span>
                            <span className={`font-bold font-mono text-sm ${kembalian >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatRupiah(Math.abs(kembalian))}
                            </span>
                        </div>

                        <PrimaryButton
                            className="justify-center w-full h-12 text-lg transition-all shadow-lg hover:shadow-xl"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || (metodePembayaran === 'tunai' && kembalian < 0)}
                        >
                            PROSES BAYAR
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
