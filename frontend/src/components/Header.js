import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Popover, PopoverButton, PopoverPanel, Dialog, DialogPanel } from '@headlessui/react';
import { ChevronDownIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon, BookOpenIcon, BuildingLibraryIcon } from '@heroicons/react/20/solid';

const actions = [
    {
        title: 'Search by title, author, or ISBN',
        description: 'Search our library to add a book.',
        href: '/add-search',
        icon: MagnifyingGlassIcon,
        iconClasses: 'text-gray-400 bg-gray-50 hover:text-pink-700 hover:bg-white',
        disabled: false,
    },
    {
        title: 'Add Manually',
        description: 'IN PROGRESS: check back later for this feature',
        href: '#',
        icon: BookOpenIcon,
        iconClasses: 'text-gray-400 bg-gray-50 hover:text-pink-700 hover:bg-white',
        disabled: true,
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-white shadow"> {/* Reduced z-index from 50 to 30 */}
            <nav className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full" aria-label="Global">
                <div className="flex items-center space-x-6 flex-1 py-4">
                    <Link to="/" className="-m-1.5 p-1.5">
                        <BuildingLibraryIcon className="h-8 w-8 text-teal-800" />
                    </Link>
                    <div className="hidden md:flex items-center space-x-6 flex-1">
                        <Link to="/" className="text-gray-800 hover:underline">
                            My Library
                        </Link>
                        <Popover className="relative">
                            {({ open, close }) => (
                                <>
                                    <PopoverButton className="inline-flex items-center text-gray-800 hover:underline focus:outline-none">
                                        Add Book
                                        <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-800" aria-hidden="true" />
                                    </PopoverButton>
                                    {open && (
                                        <PopoverPanel className="absolute left-0 mt-3 px-4 transition-transform transform-gpu duration-200 ease-out w-auto min-w-full sm:min-w-0 sm:w-screen sm:max-w-md lg:max-w-2xl">
                                            <div className="overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
                                                <div className="grid gap-4 p-4">
                                                    {actions.map((action) => (
                                                        <Link
                                                            key={action.title}
                                                            to={action.disabled ? '#' : action.href}
                                                            onClick={close}
                                                            className="group relative flex gap-x-4 rounded-lg p-4 hover:bg-gray-50 transition ease-in-out duration-150"
                                                        >
                                                            <div className={`h-10 w-10 flex-none items-center justify-center rounded-lg p-2 text-pink-700 bg-gray-100 group-hover:bg-pink-700 group-hover:text-gray-100`}>
                                                                <action.icon className="h-6 w-6" aria-hidden="true" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold">
                                                                    {action.title}
                                                                    <span className="absolute inset-0" />
                                                                </h3>
                                                                <p className="mt-1">{action.description}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </PopoverPanel>
                                    )}
                                </>
                            )}
                        </Popover>
                    </div>
                </div>
                <div className="hidden md:flex lg:justify-end">
                    <a href="#" className="text-sm font-semibold leading-6 text-gray-400 cursor-not-allowed">
                        Log in <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
                <div className="md:hidden flex items-center">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-800"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
            </nav>

            <Dialog className="lg:hidden z-40" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
                <div className="fixed inset-0 z-30 bg-black opacity-50" />
                <DialogPanel className="fixed inset-y-0 right-0 z-40 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="flex items-center justify-end">
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-2.5 text-gray-800"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                <Link
                                    to="/"
                                    className="-mx-3 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-800 hover:bg-gray-50 flex items-center gap-x-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <BuildingLibraryIcon className="h-5 w-5 text-teal-800" aria-hidden="true" />
                                    My Library
                                </Link>
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <h3 className="px-3 py-2 text-base font-semibold leading-7 text-gray-800">Add Book</h3>
                                    {actions.map((item) => (
                                        <Link
                                            key={item.title}
                                            to={item.disabled ? '#' : item.href}
                                            className={classNames(
                                                "group rounded-lg px-3 py-2 text-sm font-semibold leading-7 text-gray-800 hover:bg-gray-100 flex items-center gap-x-4",
                                                item.disabled ? 'cursor-not-allowed text-gray-400' : 'text-gray-900'
                                            )}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <div
                                                className={`h-10 w-10 flex-none items-center justify-center rounded-lg p-2 text-pink-800 bg-gray-50 group-hover:bg-white group-hover:text-teal-700`}
                                            >
                                                <item.icon className="h-6 w-6" aria-hidden="true" />
                                            </div>
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="py-6">
                                <a
                                    href="#"
                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-400 cursor-not-allowed"
                                >
                                    Log in
                                </a>
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </Dialog>
        </header>
    );
};

export default Header;
