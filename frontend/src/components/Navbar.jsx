import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user } = useUser()

    const navigate = useNavigate()

    const goHome = () => {
        navigate('/')
    }

    const login = () => {
        navigate('/logout')
    }

    const logout = () => {
        navigate('/logout')
    }

    const goToNewTrip = () => {
        navigate('/new-trip')
    }

    const goToGroup = () => {
        let path = '/group'
        navigate(path)
    }

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Left side - Logo and Links */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <button onClick={goHome} className="flex items-center gap-2 transition-transform hover:scale-105">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-sky-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="36px" height="36px" viewBox="-6 0 32 32" version="1.1">
                                <title>airplane</title>
                                <path d="M6.72 26.2c-0.040 0-0.080 0-0.12 0-0.28-0.040-0.48-0.2-0.64-0.44l-1.96-3.56-3.56-1.96c-0.24-0.12-0.4-0.36-0.44-0.64s0.040-0.52 0.24-0.72l1.8-1.8c0.2-0.2 0.48-0.28 0.76-0.24l2.040 0.36 2.68-2.68-6.48-3.2c-0.24-0.12-0.4-0.36-0.48-0.64s0.040-0.56 0.24-0.76l2-2c0.2-0.2 0.52-0.28 0.8-0.24l8.48 2.2 2.96-2.96c1.040-1.040 3.48-1.8 4.72-0.56 0.56 0.56 0.76 1.48 0.56 2.52-0.16 0.84-0.6 1.64-1.12 2.16l-2.96 2.96 2.2 8.48c0.080 0.28 0 0.6-0.24 0.8l-2 2c-0.2 0.2-0.48 0.28-0.76 0.24s-0.52-0.2-0.64-0.48l-3.2-6.48-2.68 2.68 0.36 2.040c0.040 0.28-0.040 0.56-0.24 0.76l-1.8 1.8c-0.080 0.28-0.28 0.36-0.52 0.36zM2.24 19.28l2.8 1.52c0.16 0.080 0.24 0.2 0.32 0.32l1.52 2.8 0.68-0.68-0.32-2.040c-0.040-0.28 0.040-0.56 0.24-0.76l3.84-3.84c0.2-0.2 0.48-0.28 0.76-0.24s0.52 0.2 0.64 0.48l3.2 6.48 0.8-0.8-2.2-8.48c-0.080-0.28 0-0.6 0.24-0.8l3.28-3.28c0.6-0.6 0.92-1.96 0.56-2.32s-1.72 0-2.32 0.56l-3.28 3.28c-0.2 0.2-0.52 0.28-0.8 0.24l-8.52-2.2-0.8 0.8 6.48 3.2c0.24 0.12 0.4 0.36 0.48 0.64s-0.040 0.56-0.24 0.76l-3.84 3.84c-0.2 0.2-0.48 0.28-0.76 0.24l-2.040-0.36-0.72 0.64z" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">Tripstoo</span>
                    </button>

                    {/* Navigation Links */}
                    <div className="hidden items-center gap-6 md:flex">
                        <button onClick={goToGroup} className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                            My Groups
                        </button>
                        <a href="/destinations" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                            Destinations
                        </a>
                        <a href="/explore" className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                            Explore
                        </a>
                    </div>
                </div>

                {/* Right side - New Trip Button and User Dropdown */}

                <div className="flex items-center gap-3">
                    {/* TODO: handle "+ New Trip" button */}
                    <button onClick={user ? goToNewTrip : login} className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Trip
                    </button>

                    {/* User Dropdown */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-white transition-all hover:border-blue-500 hover:shadow-md"
                            >
                                <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />

                                    {/* Dropdown Content */}
                                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
                                        <div className="border-b border-gray-100 p-3">
                                            <p className="text-sm font-medium text-gray-900">{user.username}</p>
                                            <p className="text-xs text-gray-500">user@example.com</p>
                                        </div>

                                        <div className="p-1">
                                            <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </button>
                                            <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                Billing
                                            </button>
                                            <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Settings
                                            </button>
                                        </div>

                                        <div className="border-t border-gray-100 p-1">
                                            <button onClick={logout} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : 
                    <button type="button" 
                    onClick={login}
                    class="text-heading bg-transparent box-border border border-transparent hover:bg-neutral-secondary-medium focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Sign In</button>
                    }
                </div>
            </div>
        </nav >
    );
};

export default Navbar;