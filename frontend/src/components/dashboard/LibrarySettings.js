import React, { useState, useEffect } from 'react';
import { getLibrarySettings, updateLibrarySettings } from '../../services/libraryService';
import Swal from 'sweetalert2';

const LibrarySettings = () => {
    const [settings, setSettings] = useState({
        defaultDueDays: 14,
        maxCheckoutBooks: 5
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const currentSettings = await getLibrarySettings();
            setSettings(currentSettings);
        } catch (error) {
            console.error('Failed to fetch library settings:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateLibrarySettings(settings);
            Swal.fire('Success', 'Library settings updated successfully', 'success');
        } catch (error) {
            console.error('Failed to update library settings:', error);
            Swal.fire('Error', 'Failed to update settings. Please try again.', 'error');
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Library Settings</h3>
                <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                    <div>
                        <label htmlFor="defaultDueDays" className="block text-sm font-medium text-gray-700">
                            Default Due Days
                        </label>
                        <input
                            type="number"
                            name="defaultDueDays"
                            id="defaultDueDays"
                            value={settings.defaultDueDays}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="maxCheckoutBooks" className="block text-sm font-medium text-gray-700">
                            Max Books Per Checkout
                        </label>
                        <input
                            type="number"
                            name="maxCheckoutBooks"
                            id="maxCheckoutBooks"
                            value={settings.maxCheckoutBooks}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save Settings
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LibrarySettings;