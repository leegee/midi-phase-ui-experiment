import React, { useCallback, useEffect, useRef, useState } from 'react';
import useStore from '../store';

const BASE_PITCH = 21;
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
            const notes = grid.notes || [];
            const noteToPlay = notes[currentBeat.current];

            if (noteToPlay) {
                const noteOnTime = window.performance.now();
                const noteOffTime = noteOnTime + intervalDuration;

                selectedOutput.send([NOTE_ON + outputChannel, BASE_PITCH + noteToPlay.pitch, noteToPlay.velocity || 100], noteOnTime);
                selectedOutput.send([NOTE_OFF + outputChannel, BASE_PITCH + noteToPlay.pitch, 0], noteOffTime);
            }
        });

        window.dispatchEvent(new CustomEvent('SET_CURRENT_BEAT', { detail: currentBeat.current }));
        currentBeat.current = currentBeat.current + 1;
        console.debug('tick', currentBeat);
    }, [grids, selectedOutput, outputChannel, currentBeat, intervalDuration]);

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
                {isPlaying ? 'Pause' : 'Play'}
            </button>
        </section>
    );
};

export default PlayPauseButton;
