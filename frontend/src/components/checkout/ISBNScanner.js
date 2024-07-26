import React, { useEffect } from 'react';
import Quagga from 'quagga';

const ISBNScanner = ({ onScan }) => {
    useEffect(() => {
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
            if (result && result.codeResult && result.codeResult.code) {
                onScan(result.codeResult.code);
                Quagga.stop();
            }
        });

        return () => {
            Quagga.stop();
        };
    }, [onScan]);

    return <div id="scanner" className="w-full h-full"></div>;
};

export default ISBNScanner;
