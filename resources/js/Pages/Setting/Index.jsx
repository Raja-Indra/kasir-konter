import { useState, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

export default function SettingIndex({ auth }) {
    // Ambil data global settings
    const { shop_settings } = usePage().props;

    const [previewLogo, setPreviewLogo] = useState(shop_settings.logo_toko ? `/storage/${shop_settings.logo_toko}` : null);
    
    // Cropper State
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [aspect, setAspect] = useState(1); // Default Persegi
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);

    const { data, setData, post, processing } = useForm({
        nama_toko: shop_settings.nama_toko || '',
        alamat_toko: shop_settings.alamat_toko || '',
        no_hp_toko: shop_settings.no_hp_toko || '',
        footer_struk: shop_settings.footer_struk || '',
        logo_toko: null, // File baru
    });

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
            setData('logo_toko', croppedImageFile);
            setPreviewLogo(URL.createObjectURL(croppedImageFile));
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
            e.target.value = null;
        }
    };

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
                                    {previewLogo ? (
                                        <img src={previewLogo} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-gray-400 text-xs">Belum ada logo</span>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
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

            {/* Modal Cropper */}
            <Modal show={isCropModalOpen} onClose={() => setIsCropModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Sesuaikan Logo Toko</h2>
                    
                    <div className="mb-4 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setAspect(1)}
                            className={`px-3 py-1 text-sm rounded ${aspect === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Persegi (1:1)
                        </button>
                        <button
                            type="button"
                            onClick={() => setAspect(16 / 9)}
                            className={`px-3 py-1 text-sm rounded ${aspect === 16 / 9 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            Persegi Panjang (16:9)
                        </button>
                    </div>

                    <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                minZoom={0.1}
                                restrictPosition={false}
                                aspect={aspect}
                                cropShape="rect"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        )}
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                        <span className="text-sm text-gray-600">Zoom:</span>
                        <input
                            type="range"
                            min={0.1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={() => {
                                setIsCropModalOpen(false);
                                setImageSrc(null);
                            }}
                        >
                            Batal
                        </button>
                        <PrimaryButton type="button" onClick={showCroppedImage} className="bg-blue-600 hover:bg-blue-700">
                            Terapkan
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}