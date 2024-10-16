import React, { useRef, useState } from 'react';

import './StepInput.css';
import { dispatchCurrentBeatEvent } from '../events/dispatchCurrentBeatEvent';
import useMusicStore, { GridNote } from '../store';
import { BASE_PITCH } from './PlayMIDI';

const NOTE_ON = 144;

interface StepInputProps {
    gridIndex: number;
}

const StepInput: React.FC<StepInputProps> = ({ gridIndex }) => {
    const { grids, selectedInput, setOrUpdateNoteInGrid, inputChannels } = useMusicStore();
    const grid = grids[gridIndex];
    const currentBeatRef = useRef(0);
    const [stepInputMode, setStepInputMode] = useState(false); // State for step input mode

    const handleMIDIMessage = (event: WebMidi.MIDIMessageEvent) => {
        const [status, midiNote, velocity] = event.data;
        const channel = status & 0x0F; // Get the last 4 bits

        if (inputChannels.includes(channel)) {
            // Check if it's a note on event
            if ((status & 0xF0) === NOTE_ON && velocity > 0) {
                placeNote(midiNote, velocity);
            }
        }
    };

    const toggleStepInputMode = (forceStop: boolean = false) => {
        if (stepInputMode || forceStop) {
            // Reset current beat when exiting step input mode
            currentBeatRef.current = 0;
            stopListening();
            setStepInputMode(false); // Update state
        } else {
            startListening();
            setStepInputMode(true); // Update state
        }
    };

    const startListening = () => {
        console.log('Step input: start');
        if (selectedInput) {
            selectedInput.onmidimessage = handleMIDIMessage;
        }
        dispatchCurrentBeatEvent(0);
    };

    const stopListening = () => {
        console.log('Step input: stop');
        if (selectedInput) {
            selectedInput.onmidimessage = null;
        }
        dispatchCurrentBeatEvent(-1);
    };

    const placeNote = (midiPitch: number, velocity: number) => {
        // Create a new note at the current beat
        const newNote: GridNote = {
            pitch: midiPitch - BASE_PITCH,
            velocity,
        };

        // Add the note to the current beat in the grid
        setOrUpdateNoteInGrid(gridIndex, currentBeatRef.current, newNote);

        // Increment current beat
        const nextBeat = currentBeatRef.current + 1;

        // Check if the next beat exceeds the number of columns
        if (nextBeat >= grid.numColumns) {
            toggleStepInputMode(true); // Automatically stop if out of bounds
            currentBeatRef.current = 0; // Reset current beat for the next activation
        } else {
            currentBeatRef.current = nextBeat; // Update the current beat
            dispatchCurrentBeatEvent(currentBeatRef.current);
        }
    };

    return (
        <button className={`step-input-button ${stepInputMode ? 'active' : ''}`}
            onClick={() => toggleStepInputMode()}
            title={stepInputMode ? 'Exit step input mode' : 'Enter step input mode'}
        >
            {stepInputMode ? 'Exit' : 'Step'}
        </button>
    );
};

export default StepInput;
