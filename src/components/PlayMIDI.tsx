import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useKeydown } from '../hooks/useKeydown';

import { dispatchCurrentBeatEvent } from '../events/dispatchCurrentBeatEvent';
import { PLAY_NOTE_NOW_EVENT_NAME, type PlayNoteNowDetail } from '../events/dispatchPlayNoteNowEvent';

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

    useKeydown('Space', () => {
        setIsPlaying((prev) => !prev);
        if (!isPlaying) {
            currentBeat.current = 0;
        }
    });

    const playNoteNow = useCallback((pitch: number, velocity = 75) => {
        if (!selectedOutput) return;
        const noteOnTime = window.performance.now();
        const noteOffTime = noteOnTime + intervalDuration;
        selectedOutput.send([NOTE_ON + outputChannel, BASE_PITCH + pitch, velocity], noteOnTime);
        selectedOutput.send([NOTE_OFF + outputChannel, BASE_PITCH + pitch, 0], noteOffTime);
    }, [intervalDuration, outputChannel, selectedOutput]);

    const scheduleNotes = useCallback(() => {
        if (!selectedOutput) return;

        grids.forEach((grid) => {
            const currentBeatIndex: number = currentBeat.current % (grid.numColumns || 1);
            const beat = grid.beats[currentBeatIndex]; // Access the current beat from the grid

            if (beat) {
                Object.values(beat.notes).forEach(noteToPlay => {
                    playNoteNow(noteToPlay.pitch, noteToPlay.velocity);
                });
            }
        });

        dispatchCurrentBeatEvent(currentBeat.current);

        currentBeat.current = currentBeat.current + 1;
    }, [selectedOutput, grids, playNoteNow]);

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

    useEffect(() => {
        const handlePlayNote = (event: CustomEvent<PlayNoteNowDetail>) => {
            const { pitch, velocity } = event.detail;
            playNoteNow(pitch, velocity);
        };

        window.addEventListener(PLAY_NOTE_NOW_EVENT_NAME, handlePlayNote as EventListener);

        return () => window.removeEventListener(PLAY_NOTE_NOW_EVENT_NAME, handlePlayNote as EventListener);
    }, [playNoteNow]);

    return (
        <section className='padded-container'>
            <button onClick={handlePlayPause} title='SPACE will also toggle playback'>
                {isPlaying ? '⏸︎ Pause' : '⏵︎ Play'}
            </button>
        </section>
    );
};

export default PlayPauseButton;
