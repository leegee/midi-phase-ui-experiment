// components/StepInput.tsx
import React, { useState } from 'react';
import useMusicStore, { GridNote } from '../store';

const NOTE_ON = 144;

interface StepInputProps {
    gridIndex: number;
}

const StepInput: React.FC<StepInputProps> = ({ gridIndex }) => {
    const { grids, selectedInput, addNoteToGrid, inputChannels } = useMusicStore();
    const grid = grids[gridIndex];
    const [isStepInputActive, setIsStepInputActive] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0);

    const handleMIDIMessage = (event: WebMidi.MIDIMessageEvent) => {
        const [status, note, velocity] = event.data;
        const channel = status & 0x0F; // Get the last 4 bits

        if (inputChannels.includes(channel)) {
            // Check if it's a note on event
            if ((status & 0xF0) === NOTE_ON && velocity > 0) {
                placeNote(note, velocity);
            }
        }
    };

    const toggleStepInputMode = () => {
        setIsStepInputActive(prev => !prev);
        if (isStepInputActive) {
            // Reset current beat when exiting step input mode
            setCurrentBeat(0);
            stopListening();
        } else {
            startListening();
        }
    };

    const startListening = () => {
        console.log('Step input: start');
        if (selectedInput) {
            selectedInput.onmidimessage = handleMIDIMessage;
        }
    };

    const stopListening = () => {
        console.log('Step input: stop');
        if (selectedInput) {
            selectedInput.onmidimessage = null;
        }
    };

    const placeNote = (pitch: number, velocity: number) => {
        // Create a new note at the current beat (we no longer need a startTime, as it's based on the beat index)
        const newNote: GridNote = {
            pitch,
            velocity,
        };

        // Add the note to the current beat in the grid
        addNoteToGrid(gridIndex, currentBeat, newNote);

        // Increment current beat
        setCurrentBeat(prevBeat => {
            const nextBeat = prevBeat + 1;
            // Deactivate mode if the next beat exceeds the number of columns
            if (nextBeat >= grid.numColumns) {
                toggleStepInputMode(); // Automatically stop if out of bounds
                return 0; // Reset current beat for the next activation
            }
            console.log('beat set from', prevBeat, 'to', nextBeat);
            return nextBeat;
        });
    };

    return (
        <div>
            <button onClick={toggleStepInputMode}>
                {isStepInputActive ? 'Stop' : 'Step Input'}
            </button>
            <div>
                Current Beat: {currentBeat}
            </div>
        </div>
    );
};

export default StepInput;
