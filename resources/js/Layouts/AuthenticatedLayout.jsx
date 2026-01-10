import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans">
            <style>{`
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #0f172a; }
                ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #334155; }
            `}</style>

            <nav className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/dashboard" className="font-bold text-xl text-purple-500 font-['Outfit']">
                                    ResumeMaker
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    My Resumes
                                </NavLink>
                                <NavLink href={route('user-details.index')} active={route().current('user-details.*')}>
                                    Profile Builder
                                </NavLink>
                                {user.roles && user.roles.some(r => r.name === 'admin') && (
                                    <NavLink href={route('admin.dashboard')} active={route().current('admin.*')}>
                                        Admin View
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 border border-white/10 text-sm leading-4 font-bold rounded-2xl text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white focus:outline-none transition ease-in-out duration-150 backdrop-blur-md"
                                            >
                                                {user.name}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
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

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none focus:bg-white/5 focus:text-white transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            My Resumes
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('user-details.index')} active={route().current('user-details.*')}>
                            Professional Details
                        </ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-white/10">
                        <div className="px-4">
                            <div className="font-medium text-base text-slate-200">{user.name}</div>
                            <div className="font-medium text-sm text-slate-400">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header>
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}

function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-purple-500 text-white focus:border-purple-700 '
                    : 'border-transparent text-slate-300 hover:text-white hover:border-purple-500 focus:text-white focus:border-purple-500 ') +
                className
            }
        >
            {children}
        </Link>
    );
}

function ResponsiveNavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'block w-full ps-3 pe-4 py-2 border-l-4 text-start text-base font-medium focus:outline-none transition duration-150 ease-in-out ' +
                (active
                    ? 'border-purple-500 text-white bg-indigo-50/5 focus:text-indigo-800 focus:bg-indigo-100 focus:border-indigo-700'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-slate-300 focus:text-slate-800 focus:bg-slate-50 focus:border-slate-300') +
                className
            }
        >
            {children}
        </Link>
    );
}

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <div className="relative">
            <div onClick={toggleOpen}>{children[0]}</div>

            {open && (
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
            )}

            <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div
                    className="absolute z-50 mt-2 w-48 rounded-md shadow-lg ltr:origin-top-right rtl:origin-top-left end-0"
                    onClick={() => setOpen(false)}
                >
                    <div className="rounded-md ring-1 ring-black ring-opacity-5 py-1 bg-[#18191b] border border-white/10">
                        {children[1]}
                    </div>
                </div>
            </Transition>
        </div>
    );
};

const Trigger = ({ children }) => {
    return <>{children}</>;
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-300 hover:bg-white/5 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = ({ children }) => <>{children}</>;
Dropdown.Link = DropdownLink;

