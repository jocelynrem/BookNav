import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/20/solid';

const Notification = ({
    notification = { show: false, message: '', undo: false },
    setNotification = () => { }, // Provide a default empty function
    onUndo = () => { }
}) => {
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 5000); // Close after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    return (
        <Transition show={notification.show} as="div">
            <div
                aria-live="assertive"
                className="fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-[1000] pointer-events-none"
            >
                <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition transform">
                        <div className="p-4">
                            <div className="flex items-center">
                                <div className="flex w-0 flex-1 justify-between">
                                    <p className="w-0 flex-1 text-sm font-medium text-gray-900">
                                        {notification.message}
                                    </p>
                                    {notification.undo && (
                                        <button
                                            type="button"
                                            className="ml-3 flex-shrink-0 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 pointer-events-auto"
                                            onClick={onUndo}
                                        >
                                            Undo
                                        </button>
                                    )}
                                </div>
                                <div className="ml-4 flex flex-shrink-0">
                                    <button
                                        type="button"
                                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 pointer-events-auto"
                                        onClick={() => setNotification({ ...notification, show: false })}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    );
};

Notification.propTypes = {
    notification: PropTypes.shape({
        show: PropTypes.bool,
        message: PropTypes.string,
        undo: PropTypes.bool,
    }),
    setNotification: PropTypes.func,
    onUndo: PropTypes.func,
};

export default Notification;
