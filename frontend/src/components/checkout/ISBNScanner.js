import React, { useEffect, useRef } from 'react';
import Quagga from 'quagga';

const ISBNScanner = ({ onScan, isActive }) => {
    const scannerRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            initializeScanner();
        }
        return () => {
            Quagga.offDetected(handleScan);
            Quagga.stop();
        };
    }, [isActive]);

    const initializeScanner = () => {
        Quagga.init(
            {
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: scannerRef.current,
                    constraints: {
                        width: { min: 450 },
                        height: { min: 300 },
                        facingMode: "environment",
                        aspectRatio: { min: 1, max: 2 }
                    },
                },
                decoder: {
                    readers: ["ean_reader"],
                },
                locator: {
                    patchSize: "medium",
                    halfSample: true
                },
            },
            (err) => {
                if (err) {
                    console.error('Error initializing Quagga:', err);
                    return;
                }
                Quagga.start();
            }
        );

        Quagga.onDetected(handleScan);
    };

    const handleScan = (result) => {
        if (result.codeResult.code) {
            onScan(result.codeResult.code);
        }
    };

    return <div ref={scannerRef} className="w-full h-full"></div>;
};

export default ISBNScanner;