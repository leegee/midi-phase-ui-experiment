// hooks/useKeydown.tsx

import { useEffect } from 'react';

export const useKeydown = (key: string, callback: (e: KeyboardEvent) => void) => {
    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            // Here we could filter by e.target if necessary
            if (e.code === key) {
                callback(e);
            }
        };

        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [key, callback]);
};
