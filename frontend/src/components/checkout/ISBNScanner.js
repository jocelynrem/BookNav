import React, { useEffect } from 'react';
import Quagga from 'quagga';

const ISBNScanner = ({ onScan }) => {
    useEffect(() => {
        Quagga.init(
            {
                inputStream: {
                    name: 'Live',
                    type: 'LiveStream',
                    target: document.querySelector('#scanner'),
                    constraints: {
                        width: 480,
                        height: 320,
                        facingMode: 'environment',
                    },
                },
                decoder: {
                    readers: ['ean_reader'],
                },
            },
            (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                Quagga.start();
            }
        );

        Quagga.onDetected((result) => {
            if (result.codeResult.code) {
                onScan(result.codeResult.code);
                Quagga.stop();
            }
        });

        return () => {
            Quagga.stop();
        };
    }, [onScan]);

    return <div id="scanner" className="w-full h-64 bg-gray-200"></div>;
};

export default ISBNScanner;