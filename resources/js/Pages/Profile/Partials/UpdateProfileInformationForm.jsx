import { useState, useCallback } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../../utils/cropImage';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            foto: null,
            _method: 'patch',
        });

    // Cropper State
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(user.foto ? `/storage/${user.foto}` : null);

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
            setPreviewUrl(URL.createObjectURL(croppedImageFile));
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

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Informasi Profil
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Perbarui informasi profil, alamat email, dan foto profil Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                
                {/* Foto Profile */}
                <div className="flex items-center gap-6">
                    <div className="shrink-0">
                        {previewUrl ? (
                            <img className="h-24 w-24 object-cover rounded-full shadow-md border-2 border-blue-100" src={previewUrl} alt="Avatar" />
                        ) : (
                            <div className="h-24 w-24 rounded-full shadow-md bg-blue-100 text-blue-500 flex items-center justify-center border-2 border-blue-200">
                                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block">
                            <span className="sr-only">Pilih foto profil</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100 cursor-pointer
                            "/>
                        </label>
                        <p className="mt-1 text-xs text-gray-500">JPG, GIF atau PNG. Maks 2MB.</p>
                        <InputError className="mt-2" message={errors.foto} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full bg-gray-50 focus:bg-white"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full bg-gray-50 focus:bg-white"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Alamat email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-blue-600 underline hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Link verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton className="bg-blue-600 hover:bg-blue-700" disabled={processing}>Simpan Perubahan</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-green-600">Berhasil disimpan.</p>
                    </Transition>
                </div>
            </form>

            {/* Modal Cropper */}
            <Modal show={isCropModalOpen} onClose={() => setIsCropModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Sesuaikan Foto Profil</h2>
                    <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
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
                            min={1}
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
        </section>
    );
}
