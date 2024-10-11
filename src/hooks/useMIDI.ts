// src/hooks/useMIDI.ts
import { useEffect } from 'react';
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

    useEffect(() => {
        const getMIDI = async () => {
            try {
                if ('requestMIDIAccess' in navigator) {
                    const access = await navigator.requestMIDIAccess();

                    const inputDevices = Array.from(access.inputs.values());
                    const outputDevices = Array.from(access.outputs.values());

                    setInputs(inputDevices);
                    setOutputs(outputDevices);

                    // Set Focusrite as default input/output if available
                    const defaultInput = inputDevices.find(device => device.name && /focusrite/i.test(device.name)) || null;
                    const defaultOutput = outputDevices.find(device => device.name && /focusrite/i.test(device.name)) || null;
                    setSelectedInput(defaultInput);
                    setSelectedOutput(defaultOutput);
                }

                else {
                    throw new Error('Web MIDI API is not supported in this browser.');
                }
            }

            catch (err) {
                console.error('Failed to get MIDI access', err);
                setError('Failed to get MIDI access');
            }
        };

        getMIDI();
    }, [setInputs, setOutputs, setError]);

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
