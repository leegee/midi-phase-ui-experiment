// src/hooks/useMIDI.ts

import { useEffect, useState } from 'react';

const useMIDI = () => {
    const [inputs, setInputs] = useState<WebMidi.MIDIInput[]>([]);
    const [outputs, setOutputs] = useState<WebMidi.MIDIOutput[]>([]);
    const [selectedInput, setSelectedInput] = useState<WebMidi.MIDIInput | null>(null);
    const [selectedOutput, setSelectedOutput] = useState<WebMidi.MIDIOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getMIDI = async () => {
            try {
                if ('requestMIDIAccess' in navigator) {
                    const access = await navigator.requestMIDIAccess();

                    const inputDevices = Array.from(access.inputs.values());
                    const outputDevices = Array.from(access.outputs.values());

                    setInputs(inputDevices);
                    setOutputs(outputDevices);

                    // Default to the first matching input and output devices
                    const defaultInput = inputDevices.find(device => device.name && /focusrite/i.test(device.name)) || null;
                    const defaultOutput = outputDevices.find(device => device.name && /focusrite/i.test(device.name)) || null;

                    setSelectedInput(defaultInput);
                    setSelectedOutput(defaultOutput);
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


    return { inputs, outputs, selectedInput, setSelectedInput, selectedOutput, setSelectedOutput, error };
};


export default useMIDI;
