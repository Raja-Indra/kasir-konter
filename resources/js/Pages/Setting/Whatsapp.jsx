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

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
