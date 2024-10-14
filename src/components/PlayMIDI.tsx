import React, { useCallback, useEffect, useRef, useState } from 'react';
import { dispatchCurrentBeatEvent } from '../events/eventDispatcher';
import useStore from '../store';

export const BASE_PITCH = 21;
const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;

const PlayPauseButton: React.FC = () => {
    const { bpm, outputChannel, grids, selectedOutput } = useStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const currentBeat = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const intervalRef = useRef<number | null>(null);  // New: intervalRef to store active interval
    const intervalDuration = (60 / bpm) * 1000; // Convert to milliseconds

    const scheduleNotes = useCallback(() => {
        if (!selectedOutput) return;

        grids.forEach((grid, gridIndex) => {
            const currentBeatIndex: number = currentBeat.current % (grid.numColumns || 1); // Use currentBeat from useRef
            const beat = grid.beats[currentBeatIndex]; // Access the current beat from the grid

            if (beat) {
                Object.values(beat.notes).forEach(noteToPlay => {
                    const noteOnTime = window.performance.now();
                    const noteOffTime = noteOnTime + intervalDuration;

                    selectedOutput.send([NOTE_ON + outputChannel, BASE_PITCH + noteToPlay.pitch, noteToPlay.velocity || 100], noteOnTime);
                    selectedOutput.send([NOTE_OFF + outputChannel, BASE_PITCH + noteToPlay.pitch, 0], noteOffTime);
                });
            }
        });

        dispatchCurrentBeatEvent(currentBeat.current);
        console.debug('tick', currentBeat);

        currentBeat.current = currentBeat.current + 1;
    }, [grids, selectedOutput, outputChannel, intervalDuration]);

    const startPlayback = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new window.AudioContext();
        }

        if (!intervalRef.current) {
            console.debug('Starting interval');
            scheduleNotes();
            intervalRef.current = window.setInterval(scheduleNotes, intervalDuration);
        }
    }, [scheduleNotes, intervalDuration]);

    const stopPlayback = useCallback(() => {
        if (intervalRef.current) {
            console.debug('Stopping interval');
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isPlaying) {
            startPlayback();
        } else {
            stopPlayback();
        }

        return stopPlayback;
    }, [isPlaying, startPlayback, stopPlayback]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            currentBeat.current = 0;
        }
    };

    return (
        <section className='padded-container'>
            <button onClick={handlePlayPause}>
                {isPlaying ? '⏸︎ Pause' : '⏵︎ Play'}
            </button>
        </section>
    );
};

export default PlayPauseButton;
