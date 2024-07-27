import React, { useEffect } from 'react';
import Quagga from 'quagga';

const ISBNScanner = ({ onScan }) => {
    useEffect(() => {
        let lastCode = '';
        let lastScanTime = 0;

        Quagga.init(
            {
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector('#scanner'),
                    constraints: {
                        width: 450,
                        height: 190,
                        facingMode: "environment",
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

        Quagga.onDetected((result) => {
            const code = result.codeResult.code;
            const now = Date.now();

            if (code !== lastCode || now - lastScanTime > 1000) {
                lastCode = code;
                lastScanTime = now;
                onScan(code);
            }
        });

        return () => {
            Quagga.stop();
        };
    }, [onScan]);

    return <div id="scanner" className="w-full h-full"></div>;
};

export default ISBNScanner;
