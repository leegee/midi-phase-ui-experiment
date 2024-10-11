import React, { useState, useEffect, useRef, useCallback } from 'react';
import useStore from '../store';

const BASE_PITCH = 21;
const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;

const PlayPauseButton: React.FC = () => {
    const { bpm, outputChannel, grids, selectedOutput } = useStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const intervalDuration = (60 / bpm) * 1000; // Convert to milliseconds

    const scheduleNotes = useCallback(() => {
        if (!selectedOutput) return;

        grids.forEach((grid, gridIndex) => {
            const notes = grid.notes || [];
            const currentBeat = grid.currentBeat;
            const noteToPlay = notes[currentBeat];


            if (noteToPlay) {
                const noteOnTime = window.performance.now();
                const noteOffTime = noteOnTime + intervalDuration;

                console.log(selectedOutput, 'Grid', gridIndex, 'beat', currentBeat, 'note', NOTE_ON + outputChannel, 'pitch', noteToPlay.pitch);

                selectedOutput.send([NOTE_ON + outputChannel, BASE_PITCH + noteToPlay.pitch, noteToPlay.velocity || 100], noteOnTime);
                selectedOutput.send([NOTE_OFF + outputChannel, BASE_PITCH + noteToPlay.pitch, 0], noteOffTime);
            }

            // Update the current beat for this grid using the store method
            useStore.getState().updateGridBeat(gridIndex);
        });
    }, [grids, selectedOutput, outputChannel, intervalDuration]);

    // If playing play
    useEffect(() => {
        if (isPlaying && selectedOutput) {
            if (!audioContextRef.current) {
                audioContextRef.current = new window.AudioContext();
            }

            const interval = setInterval(scheduleNotes, intervalDuration);
            return () => clearInterval(interval);
        }
    }, [isPlaying, selectedOutput, scheduleNotes, intervalDuration]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            useStore.getState().resetAllCurrentBeats();
        }
    };

    return (
        <section className='padded-container'>
            <button onClick={handlePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
            </button>
        </section>
    );
};

export default PlayPauseButton;
