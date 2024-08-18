import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

const ISBNScanner = ({ onScan, isActive }) => {
    const videoRef = useRef(null);
    const codeReader = useRef(null);

    useEffect(() => {
        if (isActive) {
            initializeScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isActive]);

    const initializeScanner = async () => {
        if (!videoRef.current) return;

        codeReader.current = new BrowserMultiFormatReader();

        try {
            const devices = await codeReader.current.listVideoInputDevices();
            if (devices.length > 0) {
                await codeReader.current.decodeFromVideoDevice(devices[0].deviceId, videoRef.current, (result, err) => {
                    if (result) {
                        onScan(result.getText());
                        stopScanner(); // Stop scanning after detecting a code
                    }
                    if (err && !(err instanceof NotFoundException)) {
                        console.error('Error decoding from video device:', err);
                    }
                });
            }
        } catch (err) {
            console.error('Error initializing ZXing:', err);
        }
    };

    const stopScanner = () => {
        if (codeReader.current) {
            codeReader.current.reset();
        }
    };

    return (
        <div className="relative w-full h-full">
            <video
                ref={videoRef}
                className="absolute top-0 left-0 w-full h-full object-cover"
                playsInline
                muted
                autoPlay
            />
        </div>
    );
};

export default ISBNScanner;
