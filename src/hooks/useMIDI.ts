import { useEffect, useRef } from 'react';
import useMusicStore from '../store';

const useMIDI = () => {
    const {
        inputs,
        setInputs,
        outputs,
        setOutputs,
        selectedInput,
        setSelectedInput,
        selectedOutput,
        setSelectedOutput,
        error,
        setError,
    } = useMusicStore();

    const accessRef = useRef<WebMidi.MIDIAccess | null>(null); // Create a ref for MIDI access

    useEffect(() => {
        const getMIDI = async () => {
            try {
                if ('requestMIDIAccess' in navigator) {
                    const access = await navigator.requestMIDIAccess();
                    accessRef.current = access; // Store access in the ref

                    const inputDevices = Array.from(access.inputs.values());
                    const outputDevices = Array.from(access.outputs.values());

                    setInputs(inputDevices);
                    setOutputs(outputDevices);

                    // Set Focusrite as default input/output if available
                    const defaultInput = inputDevices.find(device => device.name && /focusrite/i.test(device.name)) || null;
                    const defaultOutput = outputDevices.find(device => device.name && /focusrite/i.test(device.name)) || null;
                    setSelectedInput(defaultInput);
                    setSelectedOutput(defaultOutput);

                    // Listen for state changes
                    access.onstatechange = handleStateChange;
                } else {
                    throw new Error('Web MIDI API is not supported in this browser.');
                }
            } catch (err) {
                console.error('Failed to get MIDI access', err);
                setError('Failed to get MIDI access');
            }
        };

        const handleStateChange = () => {
            if (accessRef.current) { // Use the ref here
                const inputDevices = Array.from(accessRef.current.inputs.values());
                const outputDevices = Array.from(accessRef.current.outputs.values());
                setInputs(inputDevices);
                setOutputs(outputDevices);
            }
        };

        getMIDI();

        return () => {
            if (accessRef.current) {
                accessRef.current.onstatechange = null; // Cleanup listener on unmount
            }
        };
    }, [setInputs, setOutputs, setError, setSelectedInput, setSelectedOutput]);

    return {
        inputs,
        outputs,
        selectedInput,
        setSelectedInput,
        selectedOutput,
        setSelectedOutput,
        error,
    };
};

export default useMIDI;
