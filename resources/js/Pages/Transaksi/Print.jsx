import { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

export default function Print({ transaksi }) {
    const { shop_settings } = usePage().props;

    useEffect(() => {
        // Delay sedikit agar style ter-load sempurna sebelum print dialog muncul
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR',
            minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(number);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        // Menggunakan text-[10px] agar muat di kertas kecil
        <div className="bg-white min-h-screen text-black font-mono text-[10px] leading-tight">
            <Head title={`Struk-${transaksi.no_nota}`} />

            {/* Container Khusus 58mm */}
            {/* p-1 untuk margin aman kiri kanan sedikit */}
            <div className="w-[58mm] p-1 mx-auto bg-white">

                {/* --- HEADER --- */}
                <div className="text-center mb-2">
                    <h1 className="text-sm font-bold uppercase mb-1">{shop_settings.nama_toko}</h1>
                    <p>{shop_settings.alamat_toko}</p>
                    <p>{shop_settings.no_hp_toko}</p>
                </div>

                {/* --- INFO NOTA --- */}
                <div className="pb-1 mb-1 border-b border-black border-dashed">
                    <div className="flex justify-between">
                        <span>Nota</span>
                        <span>{transaksi.no_nota.split('-').pop()}</span> {/* Ambil buntut nota aja biar pendek */}
                    </div>
                    <div className="flex justify-between">
                        <span>Tgl</span>
                        <span>{formatDate(transaksi.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Kasir</span>
                        <span>{transaksi.user?.name.substring(0, 10)}</span> {/* Potong nama jika kepanjangan */}
                    </div>
                </div>

                {/* --- ITEM BELANJA --- */}
                <div className="pb-1 mb-1 border-b border-black border-dashed">
                    {transaksi.details.map((item) => (
                        <div key={item.id} className="mb-1">
                            {/* Baris 1: Nama Produk (Bold) */}
                            <div className="font-bold truncate">{item.produk?.nama_produk}</div>

                            {/* Baris 2: Hitungan (Qty x Harga = Subtotal) */}
                            <div className="flex justify-between pl-2">
                                <span>{item.qty} x {parseInt(item.harga_jual).toLocaleString()}</span>
                                <span>{parseInt(item.subtotal).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- TOTALAN --- */}
                <div className="flex justify-between font-bold text-[11px] mb-1">
                    <span>TOTAL</span>
                    <span>{formatRupiah(transaksi.total_harga)}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span>BAYAR</span>
                    <span>{formatRupiah(transaksi.bayar)}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>KEMBALI</span>
                    <span>{formatRupiah(transaksi.kembalian)}</span>
                </div>

                {/* --- FOOTER --- */}
                <div className="text-center border-t border-black border-dashed pt-2">
                    <p>{shop_settings.footer_struk}</p>
                </div>
            </div>

            {/* STYLE KHUSUS PRINT */}
            <style>{`
                @media print {
                    @page {
                        margin: 0; /* PENTING: Hilangkan margin kertas bawaan browser */
                        size: 58mm auto; /* Paksa ukuran kertas */
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: white;
                    }
                    /* Hilangkan Header/Footer bawaan browser (URL, Tanggal, dll) */
                    header, footer { display: none !important; }
                }
            `}</style>
        </div>
    );
}
