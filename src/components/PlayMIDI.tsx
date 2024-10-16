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
    const nextNoteTime = useRef<number>(0); // Time for next note in seconds
    const lookahead = 25; // How often to check (ms)
    const scheduleAheadTime = 0.1; // Schedule notes ahead by 100ms
    const intervalDuration = (60 / bpm); // Time per beat (in seconds)
    const isScheduling = useRef<boolean>(false); // Flag to stop scheduling when playback is paused

    useKeydown('Space', () => {
        setIsPlaying(prev => !prev);
        if (!isPlaying) {
            currentBeat.current = 0;
        }
    });

    const playNoteNow = useCallback((pitch: number, velocity = 75, time: number) => {
        if (!selectedOutput) return;
        const noteOnTime = time * 1000; // Convert seconds to ms
        const noteOffTime = noteOnTime + (intervalDuration * 1000); // Note length is the interval

        selectedOutput.send([NOTE_ON + outputChannel, BASE_PITCH + pitch, velocity], noteOnTime);
        selectedOutput.send([NOTE_OFF + outputChannel, BASE_PITCH + pitch, 0], noteOffTime);
    }, [intervalDuration, outputChannel, selectedOutput]);

    const scheduleNotes = useCallback(() => {
        if (!selectedOutput || !audioContextRef.current) return;

        // Schedule notes ahead of time for all grids
        while (nextNoteTime.current < audioContextRef.current.currentTime + scheduleAheadTime) {
            grids.forEach((grid) => {
                const currentBeatIndex = currentBeat.current % (grid.numColumns || 1);
                const beat = grid.beats[currentBeatIndex];

                if (beat) {
                    // Schedule notes for the current beat
                    Object.values(beat.notes).forEach(note => {
                        playNoteNow(note.pitch, note.velocity, nextNoteTime.current);
                    });
                }
            });

            dispatchCurrentBeatEvent(currentBeat.current);

            // Move to the next beat
            currentBeat.current += 1;
            nextNoteTime.current += intervalDuration; // Schedule next beat
        }
    }, [selectedOutput, grids, intervalDuration, playNoteNow]);

    const scheduler = useCallback(() => {
        if (!isPlaying || !audioContextRef.current || !isScheduling.current) return;

        scheduleNotes(); s
        setTimeout(scheduler, lookahead);
    }, [isPlaying, scheduleNotes]);

    const startPlayback = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new window.AudioContext();
        }

        nextNoteTime.current = audioContextRef.current.currentTime; // Initialize next note time
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
            playNoteNow(pitch, velocity, audioContextRef.current?.currentTime || 0);
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
