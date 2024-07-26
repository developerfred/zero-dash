'use client';

import React, { useEffect } from 'react';

const AsciiCat: React.FC = () => {
    useEffect(() => {
        const onDevToolsOpened = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.metaKey && e.altKey && e.key === 'I')
            ) {
                console.log(`%c
 /\_/\  
( o.o ) 
 > ^ <`, 'font-family:monospace; color: green;');
            }
        };

        window.addEventListener('keydown', onDevToolsOpened);

        return () => {
            window.removeEventListener('keydown', onDevToolsOpened);
        };
    }, []);

    return null;
};

export default AsciiCat;
