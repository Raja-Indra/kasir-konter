import { useState, useEffect } from 'react';
import Navbar from '@/Components/Partials/Navbar';
import Sidebar from '@/Components/Partials/Sidebar';
import Footer from '@/Components/Partials/Footer';

export default function Authenticated({ user, header, children }) {
    // State untuk mengontrol Sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        // Otomatis tutup sidebar di mobile saat pertama kali load
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">

            {/* 1. Sidebar: Kirim state dan fungsi pengubahnya ke komponen Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* 2. Wrapper Kanan */}
            <div className="flex flex-col flex-1 h-screen overflow-hidden transition-all duration-300 ease-in-out">

                {/* Navbar */}
                <Navbar user={user} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

                {/* Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>

                {/* Footer */}
                <Footer />

            </div>
        </div>
    );
}
