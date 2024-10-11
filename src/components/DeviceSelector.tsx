// src/components/DeviceSelector.tsx

import React, { useState, useEffect } from 'react';
import './DeviceSelector.css';
import useMIDI from '../hooks/useMIDI';
import store from '../store';
import InputChannelSelector from './InputChannelSelector';
import OutputChannelSelector from './OutputChannelSelector';
import Modal from './Modal';

const DeviceSelector: React.FC = () => {
    const { inputs, outputs, selectedInput, setSelectedInput, selectedOutput, setSelectedOutput } = useMIDI();
    const { inputChannels, setInputChannels, outputChannel, setOutputChannel } = store();
    const [localInputChannels, setLocalInputChannels] = useState<number[]>(inputChannels);
    const [localOutputChannel, setLocalOutputChannel] = useState<number>(outputChannel);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setInputChannels(localInputChannels);
    }, [localInputChannels, setInputChannels]);

    useEffect(() => {
        setOutputChannel(localOutputChannel);
    }, [localOutputChannel, setOutputChannel]);

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>Device Set-up</button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title='Select MIDI Devices'>
                <section className='device-selector-component'>
                    <div>
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

                        <InputChannelSelector
                            selectedChannels={localInputChannels}
                            onChange={(channels) => setLocalInputChannels(channels)}
                        />
                    </div>

                    <div>
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

                        <OutputChannelSelector
                            selectedChannel={localOutputChannel}
                            onChange={(channel) => setLocalOutputChannel(channel)}
                        />
                    </div>
                </section>
            </Modal>
        </div>
    );
};

export default DeviceSelector;
