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

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.wa.update'), {
            onSuccess: () => Swal.fire('Berhasil', 'Token Fonnte Disimpan', 'success'),
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
                Swal.fire('Berhasil', 'Pesan percobaan telah dikirim! Silakan cek WhatsApp Anda.', 'success');
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
            onSuccess: () => Swal.fire('Berhasil', 'Pengaturan Alert Stok Disimpan', 'success'),
            onError: (err) => Swal.fire('Gagal', err.error || 'Terjadi kesalahan', 'error'),
        });
    };

    const handleManualAlert = () => {
        Swal.fire({
            title: 'Kirim Alert Sekarang?',
            text: "Sistem akan mengecek stok (<= 5) dan mengirimkan pesannya ke WhatsApp admin.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim',
        }).then((result) => {
            if (result.isConfirmed) {
                alertForm.post(route('settings.wa.alert.manual'), {
                    preserveScroll: true,
                    onSuccess: () => {
                        const flashMessage = usePage().props.flash?.success;
                        Swal.fire('Selesai', flashMessage || 'Alert berhasil dikirim.', 'success');
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
                                <span className="mr-2">💬</span> Pengaturan API Fonnte
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
                                <span className="mr-2">🧪</span> Test Kirim Pesan
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

                        {/* PENGATURAN ALERT STOK */}
                        <div className="bg-white p-6 shadow-sm sm:rounded-lg md:col-span-2 border border-orange-200">
                            <div className="flex items-center justify-between border-b pb-2 mb-6">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                    <span className="mr-2">⚠️</span> Notifikasi Stok Menipis (WhatsApp)
                                </h2>
                                <div className="flex items-center space-x-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${alertForm.data.alert_stok_aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {alertForm.data.alert_stok_aktif ? 'AKTIF' : 'NONAKTIF'}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleAlertSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="flex items-center cursor-pointer mb-4">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                checked={alertForm.data.alert_stok_aktif}
                                                onChange={(e) => alertForm.setData('alert_stok_aktif', e.target.checked)}
                                            />
                                            <span className="ml-2 font-medium text-gray-700">Aktifkan Notifikasi Stok Menipis</span>
                                        </label>

                                        <InputLabel value="Nomor HP Tujuan (Admin)" />
                                        <TextInput
                                            type="text"
                                            className="w-full mt-1 mb-2"
                                            placeholder="08..."
                                            value={alertForm.data.alert_stok_no_hp}
                                            onChange={(e) => alertForm.setData('alert_stok_no_hp', e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500">
                                            Nomor WhatsApp yang akan menerima alert saat stok barang habis (sisa ≤ 5).
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
                                                    Sistem akan mengecek stok setiap jam ini, dan jika ada barang yang menipis, pesan akan otomatis terkirim.
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

                                <div className="flex justify-between items-center border-t pt-4">
                                    <SecondaryButton type="button" onClick={handleManualAlert} disabled={alertForm.processing} className="border-orange-500 text-orange-600 hover:bg-orange-50">
                                        🚀 Kirim Alert Sekarang
                                    </SecondaryButton>

                                    <PrimaryButton type="submit" disabled={alertForm.processing}>
                                        Simpan Pengaturan
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
