// src/components/DeviceSelector.tsx

import React, { useState } from 'react';
import './DeviceSelector.css';
import useStore from '../store';
import InputChannelSelector from './InputChannelSelector';
import OutputChannelSelector from './OutputChannelSelector';
import Modal from './Modal';

const DeviceSelector: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        inputs,
        outputs,
        selectedInput,
        setSelectedInput,
        selectedOutput,
        setSelectedOutput,
        inputChannels,
        setInputChannels,
        outputChannel,
        setOutputChannel,
    } = useStore();

    return (
        <>
            <button title='Choose MIDI devices and channels' onClick={() => setIsModalOpen(true)}>Device Set-up</button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title='Select MIDI Devices'>
                <section className='device-selector-component'>
                    {/* Input Section */}
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
                                    <option key={'input-' + input.id} value={input.id}>
                                        {input.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* Input Channel Selector */}
                        <InputChannelSelector
                            selectedChannels={inputChannels}
                            onChange={setInputChannels}
                        />
                    </div>

                    {/* Output Section */}
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
                                    <option key={'output-' + output.id} value={output.id}>
                                        {output.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* Output Channel Selector */}
                        <OutputChannelSelector
                            selectedChannel={outputChannel}
                            onChange={setOutputChannel}
                        />
                    </div>
                </section>
            </Modal>
        </>
    );
};

export default DeviceSelector;
