import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/solid'; // import the Heroicons book icon

const Header = () => {
    return (
        <header className="bg-gray-800 text-white py-4 mb-8">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <BookOpenIcon className="h-8 w-8 mr-2 text-white" />  {/* use the Heroicons book icon */}
                    <h1 className="text-xl font-bold">BookNav</h1>
                </div>
                <nav>
                    <Link to="/" className="mr-4 hover:underline">Book List</Link>
                    <Link to="/add" className="hover:underline">Add Book</Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
