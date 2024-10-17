import React, { useEffect, useState } from 'react';
import useStore from '../store';

const MIDIClockReporter: React.FC = () => {
    const { selectedInput } = useStore(); // Assuming selectedInput is provided by your store
    const [clockMessages, setClockMessages] = useState<number[]>([]);

    useEffect(() => {
        const handleMIDIMessages = (event: WebMidi.MIDIMessageEvent) => {
            const [status] = event.data;
            console.log(status);
            if (status === 248) { // MIDI Clock message
                setClockMessages(prev => [...prev, Date.now()]); // Store the timestamp of each clock message
            }
        };

        if (selectedInput) {
            selectedInput.onmidimessage = handleMIDIMessages;
        }

        return () => {
            if (selectedInput) {
                selectedInput.onmidimessage = null; // Cleanup on unmount
            }
        };
    }, [selectedInput]);

    return (
        <div>
            <h3>MIDI Clock Messages Received</h3>
            <ul>
                {clockMessages.map((time, index) => (
                    <li key={index}>Clock Message at: {new Date(time).toLocaleTimeString()}</li>
                ))}
            </ul>
        </div>
    );
};

export default MIDIClockReporter;
