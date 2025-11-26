import Sidebar from '@/Components/Partials/Sidebar';
import Navbar from '@/Components/Partials/Navbar';
import Footer from '@/Components/Partials/Footer';

export default function Authenticated({ user, header, children }) {
    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* 1. Panggil Sidebar */}
            <Sidebar />

            {/* 2. Wrapper untuk Kanan (Navbar + Content + Footer) */}
            <div className="flex flex-col flex-1 min-h-screen">

                {/* Panggil Navbar (Kirim props user untuk nama di pojok kanan) */}
                <Navbar user={user} />

                {/* Content Area */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {header && (
                        <header className="p-4 mb-6 bg-white rounded shadow">
                            {header}
                        </header>
                    )}

                    {children}
                </main>

                {/* Panggil Footer */}
                <Footer />

            </div>
        </div>
    );
}
