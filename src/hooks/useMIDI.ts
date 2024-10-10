// src/hooks/useMIDI.ts

import { useEffect, useState } from 'react';

const useMIDI = () => {
    const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getMIDI = async () => {
            try {
                if ('requestMIDIAccess' in navigator) {
                    const access = await navigator.requestMIDIAccess();
                    setMidiAccess(access);
                } else {
                    throw new Error('Web MIDI API is not supported in this browser.');
                }
            } catch (err) {
                console.error('Failed to get MIDI access', err);
                setError('Failed to get MIDI access');
            }
        };

        getMIDI();
    }, []);

    return { midiAccess, error };
};

export default useMIDI;
