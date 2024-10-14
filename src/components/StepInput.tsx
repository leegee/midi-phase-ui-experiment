// components/StepInput.tsx
import React, { useRef, useState } from 'react';
import useMusicStore, { GridNote, Grid } from '../store';

const NOTE_ON = 144;

interface StepInputProps {
    gridIndex: number;
}

const StepInput: React.FC<StepInputProps> = ({ gridIndex }) => {
    const { grids, setGrid } = useMusicStore();
    const grid = grids[gridIndex];
    const [isStepInputActive, setIsStepInputActive] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0);
    const midiInputsRef = useRef<WebMidi.MIDIInput[]>([]);

    const handleMIDIMessage = (event: WebMidi.MIDIMessageEvent) => {
        const [status, note, velocity] = event.data;

        // Check if it's a note on event
        if (status === NOTE_ON && velocity > 0) {
            placeNote(note, velocity);
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
        console.log('STEP start');
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then((midiAccess) => {
                midiAccess.inputs.forEach((input) => {
                    input.onmidimessage = handleMIDIMessage;
                    midiInputsRef.current.push(input);
                });
            });
        }
    };

    const stopListening = () => {
        console.log('STEP stop');
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(() => {
                midiInputsRef.current.forEach((input) => {
                    input.onmidimessage = null;
                });
                midiInputsRef.current = [];
            });
        }
    };

    const placeNote = (pitch: number, velocity: number) => {
        console.log(1, isStepInputActive);
        console.log(2);
        // Create a new note at the current beat
        const newNote: GridNote = {
            pitch,
            startTime: currentBeat,
            velocity,
        };

        // Create a copy of the current notes
        const updatedNotes = [...grid.notes];

        // Insert the new note at the position of currentBeat
        if (currentBeat < updatedNotes.length) {
            updatedNotes[currentBeat] = newNote;
        } else {
            updatedNotes.push(newNote);
        }

        console.log(updatedNotes)

        const updatedGrid: Grid = {
            notes: updatedNotes,
            numColumns: grid.numColumns,
        };

        setGrid(gridIndex, updatedGrid);

        // Increment current beat
        setCurrentBeat(prevBeat => {
            const nextBeat = prevBeat + 1;
            // Deactivate mode if the next beat exceeds the number of columns
            if (nextBeat >= grid.numColumns) {
                toggleStepInputMode();
                return 0; // Reset current beat for the next activation
            }
            console.log('beat set:', prevBeat, nextBeat);
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
