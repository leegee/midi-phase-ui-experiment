// src/components/DeviceSelector.tsx

import React from 'react';
import useMIDI from '../hooks/useMIDI';

const DeviceSelector: React.FC = () => {
    const { inputs, outputs, selectedInput, setSelectedInput, selectedOutput, setSelectedOutput } = useMIDI();

    return (
        <section className='padded-container'>
            <label>
                <select
                    value={selectedInput ? selectedInput.id : ''}
                    onChange={(e) => {
                        const input = inputs.find(i => i.id === e.target.value) || null;
                        setSelectedInput(input);
                    }}
                >
                    <option value="" disabled>Select MIDI Input</option>
                    {inputs.map(input => (
                        <option key={input.id} value={input.id}>
                            {input.name}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                <select
                    value={selectedOutput ? selectedOutput.id : ''}
                    onChange={(e) => {
                        const output = outputs.find(o => o.id === e.target.value) || null;
                        setSelectedOutput(output);
                    }}
                >
                    <option value="" disabled>Select MIDI Output</option>
                    {outputs.map(output => (
                        <option key={output.id} value={output.id}>
                            {output.name}
                        </option>
                    ))}
                </select>
            </label>
        </section>
    );
};

export default DeviceSelector;
