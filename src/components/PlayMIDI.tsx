import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useKeydown } from '../hooks/useKeydown';

import { dispatchCurrentBeatEvent } from '../events/dispatchCurrentBeatEvent';
import { PLAY_NOTE_NOW_EVENT_NAME, type PlayNoteNowDetail } from '../events/dispatchPlayNoteNowEvent';

import useStore from '../store';

export const BASE_PITCH = 21;
const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const LOOK_AHEAD_MS = 25; // How often to check (ms)
const SCHEDULE_AHEAD_SECONDS = 0.1; // Schedule notes ahead by 100ms

const PlayPauseButton: React.FC = () => {
    const { bpm, outputChannel, grids, selectedOutput } = useStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const currentBeat = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextNoteTimeInSeconds = useRef<number>(0); // Time for next note in seconds
    const isScheduling = useRef<boolean>(false); // Flag to stop scheduling when playback is paused
    const intervalDurationSeconds = (60 / bpm); // Time per beat in seconds

    useKeydown('Space', () => {
        setIsPlaying(prev => !prev);
        if (!isPlaying) {
            currentBeat.current = 0;
        }
    });

    const playNoteNow = useCallback(async (pitch: number, velocity = 75) => {
        if (!selectedOutput || !audioContextRef.current) return;
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        pitch += BASE_PITCH;
        const currentTime = audioContextRef.current.currentTime; // Current time in seconds
        const noteOnTime = currentTime; // Now
        const noteOffTime = currentTime + intervalDurationSeconds; // After the duration

        console.log(selectedOutput);

        console.log(`Playing note: ${pitch}, velocity: ${velocity}, time: ${noteOnTime}`);
        selectedOutput.send([NOTE_ON + outputChannel, pitch, velocity], noteOnTime);

        console.log(`Stopping note: ${pitch}, time: ${noteOffTime}`);
        selectedOutput.send([NOTE_OFF + outputChannel, pitch, 0], noteOffTime);
    }, [intervalDurationSeconds, outputChannel, selectedOutput]);

    const scheduleNotes = useCallback(async () => {
        if (!selectedOutput || !audioContextRef.current) return;
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const currentTime = audioContextRef.current.currentTime; // Get current audio context time

        // Schedule notes ahead of time for all grids
        while (nextNoteTimeInSeconds.current < currentTime + SCHEDULE_AHEAD_SECONDS) {
            grids.forEach((grid) => {
                const currentBeatIndex = currentBeat.current % (grid.numColumns || 1);
                const beat = grid.beats[currentBeatIndex];

                if (beat) {
                    // Schedule notes for the current beat
                    Object.values(beat.notes).forEach(note => {
                        playNoteNow(note.pitch, note.velocity);
                    });
                }
            });

            dispatchCurrentBeatEvent(currentBeat.current);

            // Move to the next beat
            currentBeat.current += 1;
            nextNoteTimeInSeconds.current += intervalDurationSeconds; // Schedule next beat
        }
    }, [selectedOutput, grids, intervalDurationSeconds, playNoteNow]);

    const scheduler = useCallback(() => {
        if (!isPlaying || !audioContextRef.current || !isScheduling.current) return;
        scheduleNotes();
        setTimeout(scheduler, LOOK_AHEAD_MS);
    }, [isPlaying, scheduleNotes]);

    const startPlayback = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new window.AudioContext();
        }

        nextNoteTimeInSeconds.current = audioContextRef.current.currentTime; // Initialize next note time
        // Start scheduling
        isScheduling.current = true;
        scheduler();
    }, [scheduler]);

    const stopPlayback = useCallback(() => {
        isScheduling.current = false;
        currentBeat.current = 0;
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
            currentBeat.current = 0; // Reset current beat when pausing
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
