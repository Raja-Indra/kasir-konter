import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function WhatsappSetting({ auth }) {
    // Ambil data global settings
    const { shop_settings, errors } = usePage().props;

    const { data, setData, post, processing } = useForm({
        fonnte_token: shop_settings.fonnte_token || '',
    });

    const testForm = useForm({
        no_hp: '',
    });

    const alertForm = useForm({
        alert_stok_aktif: shop_settings.alert_stok_aktif === '1',
        alert_stok_mode: shop_settings.alert_stok_mode || 'manual',
        alert_stok_jam: shop_settings.alert_stok_jam || '08:00',
        alert_stok_no_hp: shop_settings.alert_stok_no_hp || '',
    });

    const laporanForm = useForm({
        laporan_wa_aktif: shop_settings.laporan_wa_aktif === '1',
        laporan_wa_no_hp: shop_settings.laporan_wa_no_hp || '',
        laporan_wa_jam: shop_settings.laporan_wa_jam || '23:50',
        laporan_wa_harian_aktif: shop_settings.laporan_wa_harian_aktif === '1',
        laporan_wa_mingguan_aktif: shop_settings.laporan_wa_mingguan_aktif === '1',
        laporan_wa_bulanan_aktif: shop_settings.laporan_wa_bulanan_aktif === '1',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.wa.update'), {
            onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Token Fonnte Disimpan', showConfirmButton: false, timer: 3000, timerProgressBar: true }),
            onError: (err) => Swal.fire('Gagal', err.error || 'Terjadi kesalahan', 'error'),
        });
    };

    const handleTest = (e) => {
        e.preventDefault();
        if (!data.fonnte_token && !shop_settings.fonnte_token) {
            Swal.fire('Gagal', 'Silakan simpan Token Fonnte terlebih dahulu', 'warning');
            return;
        }

        testForm.post(route('settings.wa.test'), {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Pesan percobaan telah dikirim!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                testForm.reset();
            },
            onError: (err) => {
                Swal.fire('Gagal', err.error || 'Pesan percobaan gagal dikirim', 'error');
            }
        });
    };

    const handleAlertSubmit = (e) => {
        e.preventDefault();
        alertForm.post(route('settings.wa.alert'), {
            preserveScroll: true,
            onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Pengaturan Alert Stok Disimpan', showConfirmButton: false, timer: 3000, timerProgressBar: true }),
            onError: (err) => Swal.fire('Gagal', err.error || 'Terjadi kesalahan', 'error'),
        });
    };

    const handleLaporanSubmit = (e) => {
        e.preventDefault();
        laporanForm.post(route('settings.wa.laporan'), {
            preserveScroll: true,
            onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Pengaturan Laporan WA Disimpan', showConfirmButton: false, timer: 3000, timerProgressBar: true }),
            onError: (err) => Swal.fire('Gagal', err.error || 'Terjadi kesalahan', 'error'),
        });
    };

    const handleManualLaporan = (periode) => {
        Swal.fire({
            title: `Kirim Laporan ${periode}?`,
            text: "Laporan PDF akan dibuat dan dikirim ke nomor WhatsApp yang diatur.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim',
        }).then((result) => {
            if (result.isConfirmed) {
                laporanForm.post(route('settings.wa.laporan.manual', { periode }), {
                    preserveScroll: true,
                    onSuccess: () => {
                        const flashMessage = usePage().props.flash?.success;
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flashMessage || 'Laporan berhasil dikirim', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    },
                    onError: (err) => Swal.fire('Gagal', err.error || 'Gagal mengirim laporan', 'error'),
                });
            }
        });
    };

    const handleManualAlert = () => {
        Swal.fire({
            title: 'Kirim Alert Sekarang?',
            text: "Sistem akan mengecek stok yang dibawah 3 dan mengirimkan pesannya ke WhatsApp Owner.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim',
        }).then((result) => {
            if (result.isConfirmed) {
                alertForm.post(route('settings.wa.alert.manual'), {
                    preserveScroll: true,
                    onSuccess: () => {
                        const flashMessage = usePage().props.flash?.success;
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: flashMessage || 'Alert berhasil dikirim', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    },
                    onError: (err) => Swal.fire('Gagal', err.error || 'Gagal memproses alert manual', 'error'),
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Integrasi WhatsApp" />

            <div className="py-6">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        
                        {/* FORM TOKEN */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2 flex items-center">
                                <span className="mr-2"></span> Pengaturan API Fonnte
                            </h2>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <InputLabel value="Fonnte API Token" />
                                    <TextInput 
                                        className="w-full mt-1" 
                                        type="password"
                                        placeholder="Masukkan token API Fonnte Anda..."
                                        value={data.fonnte_token} 
                                        onChange={e => setData('fonnte_token', e.target.value)} 
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Dapatkan token Anda dari <a href="https://md.fonnte.com/" target="_blank" className="text-blue-600 hover:underline">Dashboard Fonnte</a>.
                                    </p>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <PrimaryButton disabled={processing}>Simpan Token</PrimaryButton>
                                </div>
                            </form>
                        </div>

                        {/* FORM TEST */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2 flex items-center">
                                <span className="mr-2"></span> Test Kirim Pesan
                            </h2>

                            <p className="text-sm text-gray-600 mb-4">
                                Gunakan fitur ini untuk menguji apakah token Fonnte sudah valid dan perangkat WhatsApp telah terhubung dengan benar.
                            </p>

                            <form onSubmit={handleTest}>
                                <div className="mb-4">
                                    <InputLabel value="Nomor WhatsApp Tujuan" />
                                    <TextInput 
                                        className="w-full mt-1" 
                                        placeholder="Contoh: 081234567890"
                                        value={testForm.data.no_hp} 
                                        onChange={e => testForm.setData('no_hp', e.target.value)} 
                                        required
                                    />
                                    {errors.no_hp && <p className="text-red-500 text-xs mt-1">{errors.no_hp}</p>}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <SecondaryButton type="submit" disabled={testForm.processing} className="!bg-green-600 !text-white hover:!bg-green-700">
                                        Kirim Pesan Percobaan
                                    </SecondaryButton>
                                </div>
                            </form>
                        </div>

                        {/* PENGATURAN ALERT STOK & SALDO */}
                        <div className={`bg-white shadow-sm sm:rounded-lg md:col-span-2 border ${alertForm.data.alert_stok_aktif ? 'border-orange-200' : 'border-gray-200'}`}>
                            <form onSubmit={handleAlertSubmit}>
                                <div className={`flex items-center justify-between p-6 ${alertForm.data.alert_stok_aktif ? 'border-b pb-4' : ''}`}>
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                        <span className="mr-2"></span> Notifikasi Stok & Saldo Menipis (WhatsApp)
                                    </h2>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-sm font-medium ${alertForm.data.alert_stok_aktif ? 'text-green-600' : 'text-gray-500'}`}>
                                            {alertForm.data.alert_stok_aktif ? 'ON' : 'OFF'}
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={alertForm.data.alert_stok_aktif}
                                                onChange={(e) => alertForm.setData('alert_stok_aktif', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                        </label>
                                    </div>
                                </div>

                                {alertForm.data.alert_stok_aktif && (
                                    <div className="p-6 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <InputLabel value="Nomor HP Tujuan (Admin/Owner)" />
                                                <TextInput
                                                    type="text"
                                                    className="w-full mt-1 mb-2"
                                                    placeholder="08..."
                                                    value={alertForm.data.alert_stok_no_hp}
                                                    onChange={(e) => alertForm.setData('alert_stok_no_hp', e.target.value)}
                                                />
                                                <p className="text-xs text-gray-500">
                                                    Nomor WhatsApp yang akan menerima alert saat stok barang menipis (sisa ≤ 3) atau saldo provider menipis (≤ Rp 50.000).
                                                </p>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-4 rounded-lg border">
                                                <InputLabel value="Mode Pengiriman" />
                                                <select
                                                    className="w-full mt-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mb-4"
                                                    value={alertForm.data.alert_stok_mode}
                                                    onChange={(e) => alertForm.setData('alert_stok_mode', e.target.value)}
                                                >
                                                    <option value="manual">Kirim Manual</option>
                                                    <option value="otomatis">Kirim Otomatis (Terjadwal)</option>
                                                </select>

                                                {alertForm.data.alert_stok_mode === 'otomatis' && (
                                                    <div>
                                                        <InputLabel value="Jam Pengiriman Otomatis (Setiap Hari)" />
                                                        <TextInput
                                                            type="time"
                                                            className="w-full mt-1"
                                                            value={alertForm.data.alert_stok_jam}
                                                            onChange={(e) => alertForm.setData('alert_stok_jam', e.target.value)}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-2 text-justify">
                                                            Sistem akan mengecek stok dan saldo setiap jam ini, dan jika ada barang atau saldo yang menipis, pesan akan otomatis terkirim.
                                                        </p>
                                                    </div>
                                                )}
                                                {alertForm.data.alert_stok_mode === 'manual' && (
                                                    <p className="text-xs text-gray-500 mt-2 text-justify">
                                                        Pilih "Kirim Manual" jika Anda ingin memicu pengiriman alert secara langsung melalui tombol di bawah ini.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={`flex items-center px-6 pb-6 ${alertForm.data.alert_stok_aktif ? 'justify-between pt-4 border-t' : 'justify-end'}`}>
                                    {alertForm.data.alert_stok_aktif && (
                                        <SecondaryButton type="button" onClick={handleManualAlert} disabled={alertForm.processing} className="border-orange-500 text-orange-600 hover:bg-orange-50">
                                            Kirim Alert Sekarang
                                        </SecondaryButton>
                                    )}

                                    <PrimaryButton type="submit" disabled={alertForm.processing}>
                                        Simpan Pengaturan
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                        {/* PENGATURAN LAPORAN PENJUALAN (WHATSAPP) */}
                        <div className={`bg-white shadow-sm sm:rounded-lg md:col-span-2 border ${laporanForm.data.laporan_wa_aktif ? 'border-blue-200' : 'border-gray-200'}`}>
                            <form onSubmit={handleLaporanSubmit}>
                                <div className={`flex items-center justify-between p-6 ${laporanForm.data.laporan_wa_aktif ? 'border-b pb-4' : ''}`}>
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                        <span className="mr-2"></span> Pengaturan Laporan Penjualan (WhatsApp)
                                    </h2>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-sm font-medium ${laporanForm.data.laporan_wa_aktif ? 'text-blue-600' : 'text-gray-500'}`}>
                                            {laporanForm.data.laporan_wa_aktif ? 'ON' : 'OFF'}
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={laporanForm.data.laporan_wa_aktif}
                                                onChange={(e) => laporanForm.setData('laporan_wa_aktif', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>

                                {laporanForm.data.laporan_wa_aktif && (
                                    <div className="p-6 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <InputLabel value="Nomor HP Tujuan (Admin / Owner)" />
                                                <TextInput
                                                    type="text"
                                                    className="w-full mt-1 mb-2"
                                                    placeholder="08..."
                                                    value={laporanForm.data.laporan_wa_no_hp}
                                                    onChange={(e) => laporanForm.setData('laporan_wa_no_hp', e.target.value)}
                                                />
                                                <p className="text-xs text-gray-500 mb-4">
                                                    Nomor WhatsApp yang akan menerima laporan penjualan dalam bentuk PDF.
                                                </p>

                                                <InputLabel value="Jam Pengiriman Laporan" />
                                                <TextInput
                                                    type="time"
                                                    className="w-full mt-1 mb-6"
                                                    value={laporanForm.data.laporan_wa_jam}
                                                    onChange={(e) => laporanForm.setData('laporan_wa_jam', e.target.value)}
                                                />

                                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                            checked={laporanForm.data.laporan_wa_harian_aktif}
                                                            onChange={(e) => laporanForm.setData('laporan_wa_harian_aktif', e.target.checked)}
                                                        />
                                                        <span className="ml-2 font-medium text-gray-700">Kirim Laporan Harian ({laporanForm.data.laporan_wa_jam})</span>
                                                    </label>

                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                            checked={laporanForm.data.laporan_wa_mingguan_aktif}
                                                            onChange={(e) => laporanForm.setData('laporan_wa_mingguan_aktif', e.target.checked)}
                                                        />
                                                        <span className="ml-2 font-medium text-gray-700">Kirim Laporan Mingguan (Minggu {laporanForm.data.laporan_wa_jam})</span>
                                                    </label>

                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                            checked={laporanForm.data.laporan_wa_bulanan_aktif}
                                                            onChange={(e) => laporanForm.setData('laporan_wa_bulanan_aktif', e.target.checked)}
                                                        />
                                                        <span className="ml-2 font-medium text-gray-700">Kirim Laporan Bulanan (Akhir Bulan {laporanForm.data.laporan_wa_jam})</span>
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-4 rounded-lg border border-dashed border-gray-300 flex flex-col justify-center items-center">
                                                <p className="text-sm text-gray-600 mb-4 text-center">
                                                    Anda juga dapat mengirimkan laporan secara manual (sekarang) untuk menguji format PDF yang akan dikirimkan.
                                                </p>
                                                <div className="flex flex-col w-full space-y-2">
                                                    <SecondaryButton type="button" onClick={() => handleManualLaporan('harian')} disabled={laporanForm.processing} className="w-full justify-center text-blue-600 border-blue-500 hover:bg-blue-50">
                                                        Kirim Manual: Harian (Hari Ini)
                                                    </SecondaryButton>
                                                    <SecondaryButton type="button" onClick={() => handleManualLaporan('mingguan')} disabled={laporanForm.processing} className="w-full justify-center text-indigo-600 border-indigo-500 hover:bg-indigo-50">
                                                        Kirim Manual: Mingguan (Minggu Ini)
                                                    </SecondaryButton>
                                                    <SecondaryButton type="button" onClick={() => handleManualLaporan('bulanan')} disabled={laporanForm.processing} className="w-full justify-center text-purple-600 border-purple-500 hover:bg-purple-50">
                                                        Kirim Manual: Bulanan (Bulan Ini)
                                                    </SecondaryButton>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={`flex items-center px-6 pb-6 ${laporanForm.data.laporan_wa_aktif ? 'justify-end pt-4 border-t' : 'justify-end'}`}>
                                    <PrimaryButton type="submit" disabled={laporanForm.processing}>
                                        Simpan Pengaturan Laporan
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
