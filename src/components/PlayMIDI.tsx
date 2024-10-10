import React, { useState, useEffect, useRef, useCallback } from 'react';

import useMIDI from '../hooks/useMIDI';
import useStore from '../store';
import type { GridNote } from '../store';

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;

const PlayPauseButton: React.FC = () => {
    const { selectedOutput } = useMIDI();  // Get selected MIDI output
    const [isPlaying, setIsPlaying] = useState(false);
    const phrases = useStore((state) => state.phrases);  // Get the note phrases from store

    const audioContextRef = useRef<AudioContext | null>(null);
    const bpm = 120;  // Beats per minute
    const intervalDuration = (60 / bpm);  // Time per beat in seconds

    const scheduleNotes = useCallback((startTime: number) => {
        const currentTime = window.performance.now(); // Use high-resolution time from `performance.now()`

        phrases.forEach((phrase) => {
            const notes = phrase.notes || [];

            notes.forEach((note: GridNote) => {
                // Calculate the exact timestamp for the note-on and note-off events
                const noteOnTime = startTime + (note.startTime * intervalDuration * 1000);
                const noteOffTime = noteOnTime + (intervalDuration * 1000);  // Define note duration

                // Schedule the note-on event using `output.send()`
                if (selectedOutput) {
                    selectedOutput.send([NOTE_ON, note.pitch, note.velocity || 127], currentTime + noteOnTime);

                    // Schedule the note-off event
                    selectedOutput.send([NOTE_OFF, note.pitch, 0], currentTime + noteOffTime);
                }
            });
        });
    }, [phrases, selectedOutput, intervalDuration]);

    useEffect(() => {
        if (isPlaying && selectedOutput) {
            if (!audioContextRef.current) {
                audioContextRef.current = new window.AudioContext();
            }

            const startTime = audioContextRef.current.currentTime;

            scheduleNotes(startTime);
        }

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, [isPlaying, selectedOutput, scheduleNotes]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div>
            <button onClick={handlePlayPause}>
                {isPlaying ? 'Pause' : 'Play'}
            </button>
        </div>
    );
};

export default PlayPauseButton;
