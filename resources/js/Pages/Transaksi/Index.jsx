import { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function TransaksiIndex({ auth, products }) {
    // --- STATE ---
    const { errors } = usePage().props;
    const [keyword, setKeyword] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'fisik', 'digital'
    const [cart, setCart] = useState([]);
    const [bayar, setBayar] = useState('');
    const [umur, setUmur] = useState('');

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

        let finalModal = product.harga_modal;
        let finalJual = product.harga_jual;

        // --- LOGIKA HARGA FLEKSIBEL (POPUP UPDATE) ---
        if (product.is_flexible_price) {
            // Kita ambil Biaya Admin dari database (yang disimpan di kolom harga_jual)
            const biayaAdmin = parseFloat(product.harga_jual);

            const { value: nominalInput } = await MySwal.fire({
                title: 'Input Nominal Top Up',
                html:
                    `<p class="text-sm text-gray-600 mb-4">Biaya Admin: <b>${formatRupiah(biayaAdmin)}</b></p>` +
                    '<label class="block text-left text-sm mb-1 font-bold">Nominal Pengisian</label>' +
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

            // RUMUS UTAMA:
            // Harga Modal = Nominal yang diinput (Saldo provider terpotong segini)
            // Harga Jual  = Nominal + Biaya Admin
            finalModal = nominal;
            finalJual  = nominal + biayaAdmin;

            // Konfirmasi Akhir ke Kasir (Opsional, biar gak salah input)
            const confirm = await MySwal.fire({
                title: 'Konfirmasi',
                html: `
                    <div class="text-left text-sm">
                        <p>Nominal: <b>${formatRupiah(nominal)}</b></p>
                        <p>Admin: <b>${formatRupiah(biayaAdmin)}</b></p>
                        <hr class="my-2"/>
                        <p class="text-lg">Total Tagihan: <b class="text-indigo-600">${formatRupiah(finalJual)}</b></p>
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
                MySwal.fire({ icon: 'warning', title: 'Stok Terbatas', timer: 1500, showConfirmButton: false });
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
            MySwal.fire({ icon: 'warning', title: 'Stok Terbatas', timer: 1000, showConfirmButton: false });
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
    const kembalian = (parseFloat(bayar) || 0) - totalHarga;

    // --- LOGIC 5: Submit Transaksi ---
    const handleCheckout = () => {
        if (cart.length === 0) return MySwal.fire('Keranjang Kosong', 'Pilih produk dulu', 'warning');
        if ((parseFloat(bayar) || 0) < totalHarga) return MySwal.fire('Uang Kurang', 'Nominal pembayaran kurang dari total belanja', 'error');

        MySwal.fire({
            title: 'Proses Transaksi?',
            text: `Total: ${formatRupiah(totalHarga)}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Bayar',
            confirmButtonColor: '#10B981'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('transaksi.store'), {
                    cart: cart,
                    total_harga: totalHarga,
                    bayar: parseFloat(bayar),
                    umur_pelanggan: umur
                }, {
                    onSuccess: () => {
                        setCart([]);
                        setBayar('');
                        setUmur('');
                        MySwal.fire('Berhasil!', 'Transaksi tersimpan & Stok berkurang.', 'success');
                    },
                    onError: (errors) => {
                        MySwal.fire('Gagal', errors.error || 'Terjadi kesalahan sistem', 'error');
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Kasir" />

            <div className="flex flex-col h-screen overflow-hidden bg-gray-100 lg:flex-row">

                {/* --- BAGIAN KIRI: KATALOG PRODUK (70%) --- */}
                <div className="flex flex-col flex-1 h-full overflow-hidden">
                    {/* Header Katalog */}
                    <div className="z-10 p-4 bg-white shadow">
                        <div className="flex gap-4 mb-4">
                            <TextInput
                                className="w-full"
                                placeholder="Cari nama produk..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                autoFocus
                            />
                        </div>
                        {/* Tab Filter */}
                        <div className="flex space-x-2">
                            {['all', 'fisik', 'digital'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                                        activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {tab === 'all' ? 'Semua' : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid Produk (Scrollable) */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className={`
                                        bg-white p-4 rounded-lg shadow cursor-pointer transition transform hover:scale-105 hover:shadow-lg border-2
                                        ${product.stok <= 0 && !product.is_digital ? 'opacity-50 border-gray-200 pointer-events-none' : 'border-transparent hover:border-indigo-500'}
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${product.is_digital ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {product.is_digital ? 'Digital' : 'Fisik'}
                                        </span>
                                        {!product.is_digital && (
                                            <span className={`text-xs font-bold ${product.stok <= 5 ? 'text-red-500' : 'text-gray-500'}`}>
                                                Stok: {product.stok}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="h-10 text-sm font-bold text-gray-800 line-clamp-2">{product.nama_produk}</h3>
                                    <p className="mt-2 font-bold text-indigo-600">{formatRupiah(product.harga_jual)}</p>
                                </div>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="py-10 text-center text-gray-500 col-span-full">
                                    Produk tidak ditemukan.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- BAGIAN KANAN: KERANJANG (30%) --- */}
                <div className="flex flex-col w-full h-full bg-white border-l border-gray-200 shadow-xl lg:w-96">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="flex items-center text-lg font-bold text-gray-800">
                            🛒 Keranjang <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">{cart.length}</span>
                        </h2>
                    </div>

                    {/* List Item Keranjang */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="mt-10 text-center text-gray-400">
                                <p>Keranjang kosong</p>
                                <p className="text-sm">Klik produk di kiri untuk menambah.</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-2 border border-gray-100 rounded bg-gray-50">
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.nama_produk}</h4>
                                        <p className="text-xs font-bold text-indigo-600">{formatRupiah(item.harga_jual)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 font-bold text-gray-600 bg-gray-200 rounded hover:bg-gray-300">-</button>
                                        <input
                                            type="text"
                                            readOnly
                                            value={item.qty}
                                            className="w-8 p-0 text-sm text-center bg-transparent border-none focus:ring-0"
                                        />
                                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 font-bold text-indigo-600 bg-indigo-100 rounded hover:bg-indigo-200">+</button>
                                        <button onClick={() => removeFromCart(item.id)} className="ml-1 text-red-500 hover:text-red-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Checkout */}
                    <div className="p-4 space-y-3 border-t border-gray-200 bg-gray-50">
                        {/* Summary */}
                        <div className="flex justify-between text-lg font-bold text-gray-800">
                            <span>Total:</span>
                            <span>{formatRupiah(totalHarga)}</span>
                        </div>

                        {/* Input Bayar & Umur */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">Uang Bayar (Rp)</label>
                                <TextInput
                                    type="number"
                                    className="w-full text-right"
                                    placeholder="0"
                                    value={bayar}
                                    onChange={(e) => setBayar(e.target.value)}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs text-gray-500">Umur (Thn)</label>
                                <TextInput
                                    type="number"
                                    className="w-full text-center"
                                    placeholder="Opsional"
                                    value={umur}
                                    onChange={(e) => setUmur(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Kembalian Display */}
                        <div className={`flex justify-between text-sm font-semibold px-2 py-1 rounded ${kembalian >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span>Kembalian:</span>
                            <span>{formatRupiah(kembalian)}</span>
                        </div>

                        <PrimaryButton
                            className="justify-center w-full h-12 text-lg"
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || kembalian < 0}
                        >
                            PROSES BAYAR
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
