import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Swal from 'sweetalert2';

export default function SettingIndex({ auth }) {
    // Ambil data global settings
    const { shop_settings } = usePage().props;

    const { data, setData, post, processing } = useForm({
        nama_toko: shop_settings.nama_toko || '',
        alamat_toko: shop_settings.alamat_toko || '',
        no_hp_toko: shop_settings.no_hp_toko || '',
        footer_struk: shop_settings.footer_struk || '',
        logo_toko: null, // File baru
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.update'), {
            onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Pengaturan Toko Disimpan', showConfirmButton: false, timer: 3000, timerProgressBar: true }),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pengaturan Toko" />

            <div className="py-6">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm sm:rounded-lg max-w-2xl mx-auto">
                        
                        <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">⚙️ Pengaturan Toko</h2>

                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            
                            {/* LOGO */}
                            <div className="mb-6 flex flex-col items-center">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden mb-2">
                                    {shop_settings.logo_toko ? (
                                        <img src={`/storage/${shop_settings.logo_toko}`} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-gray-400 text-xs">Belum ada logo</span>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    onChange={e => setData('logo_toko', e.target.files[0])}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: PNG/JPG/JPEG (Max 2MB)</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <InputLabel value="Nama Toko" />
                                    <TextInput className="w-full mt-1" value={data.nama_toko} onChange={e => setData('nama_toko', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel value="Alamat" />
                                    <TextInput className="w-full mt-1" value={data.alamat_toko} onChange={e => setData('alamat_toko', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel value="No HP / Telp" />
                                    <TextInput className="w-full mt-1" value={data.no_hp_toko} onChange={e => setData('no_hp_toko', e.target.value)} />
                                </div>
                                <div>
                                    <InputLabel value="Footer Struk (Pesan Bawah)" />
                                    <TextInput className="w-full mt-1" value={data.footer_struk} onChange={e => setData('footer_struk', e.target.value)} />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}