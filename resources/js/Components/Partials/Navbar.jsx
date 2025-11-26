import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';

export default function Navbar({ user }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <nav className="bg-white border-b border-gray-100">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    {/* Kiri: Judul Halaman atau Breadcrumb */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-800">
                            Sistem Manajemen
                        </h1>
                    </div>

                    {/* Kanan: User Dropdown (Default Breeze) */}
                    <div className="hidden sm:flex sm:items-center sm:ms-6">
                        <div className="relative ms-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button className="inline-flex items-center px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out bg-white border border-transparent rounded-md hover:text-gray-700 focus:outline-none">
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
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>

                    {/* Hamburger Menu (Mobile) - Opsional, disederhanakan */}
                    <div className="flex items-center -me-2 sm:hidden">
                        <button onClick={() => setShowingNavigationDropdown((previousState) => !previousState)} className="p-2 text-gray-400 rounded-md hover:text-gray-500 focus:outline-none">
                            <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive Menu Logic bisa ditaruh disini jika diperlukan */}
        </nav>
    );
}
