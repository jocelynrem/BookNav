import React, { useEffect, useState, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

const ISBNScannerModal = ({ isOpen, onClose, onDetected }) => {
    const videoRef = useRef(null);
    const codeReader = useRef(null);

    useEffect(() => {
        if (isOpen) {
            codeReader.current = new BrowserMultiFormatReader();
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    const startScanner = async () => {
        try {
            const devices = await codeReader.current.listVideoInputDevices();
            if (devices.length > 0 && videoRef.current) {
                await codeReader.current.decodeFromVideoDevice(devices[0].deviceId, videoRef.current, (result, err) => {
                    if (result) {
                        onDetected(result.getText());
                        stopScanner();
                    }
                    if (err && !(err instanceof NotFoundException)) {
                        console.error(err);
                    }
                });
            }
        } catch (err) {
            console.error(`Error starting the scanner: ${err.message}`);
        }
    };

    const stopScanner = () => {
        if (codeReader.current) {
            codeReader.current.reset();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div className="bg-white p-6 rounded-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
                <video ref={videoRef} className="rounded-md w-full h-60 mb-4" />
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default ISBNScannerModal;
