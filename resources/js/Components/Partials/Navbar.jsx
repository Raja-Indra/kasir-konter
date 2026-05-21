import { useState, useEffect } from 'react';
import Dropdown from '@/Components/Dropdown';
import { Link } from '@inertiajs/react';

export default function Navbar({ user, toggleSidebar, isSidebarOpen }) {
    // --- STATE FULLSCREEN ---
    const [isFullscreen, setIsFullscreen] = useState(false);

    // --- EFFECT: Deteksi tombol Esc ---
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // --- FUNCTION: Toggle ---
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-blue-800 to-blue-500 shadow-md">
            <div className="max-w-full px-4 mx-auto sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    {/* Kiri: Judul Halaman / Hamburger (Mobile) */}
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="inline-flex items-center justify-center p-2 text-white transition duration-150 ease-in-out rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 md:hidden"
                        >
                            <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path
                                    className={!isSidebarOpen ? 'inline-flex' : 'hidden'}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                                <path
                                    className={isSidebarOpen ? 'inline-flex' : 'hidden'}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        {/* Judul Sistem (Opsional) */}
                        <h1 className="hidden ml-2 text-xl font-semibold text-white md:block">
                            Sistem Manajemen
                        </h1>
                    </div>

                    {/* Kanan: Actions */}
                    <div className="flex items-center">

                        {/* --- TOMBOL FULLSCREEN (BARU DISINI) --- */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 mr-2 text-white transition rounded-full hover:text-blue-100 hover:bg-blue-600 focus:outline-none"
                            title={isFullscreen ? "Keluar Fullscreen" : "Masuk Fullscreen"}
                        >
                            {isFullscreen ? (
                                // Icon Compress (Exit)
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            ) : (
                                // Icon Expand (Enter)
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            )}
                        </button>
                        {/* -------------------------------------- */}

                        {/* User Dropdown */}
                        <div className="relative ml-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-white transition duration-150 ease-in-out bg-transparent border border-transparent rounded-md hover:text-blue-100 focus:outline-none">
                                            {user.name}
                                            <svg className="ms-2 -me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Logout
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
