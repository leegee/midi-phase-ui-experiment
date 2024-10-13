import React, { useCallback, useEffect, useRef, useState } from 'react';
import useStore from '../store';

const BASE_PITCH = 21;
const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;

const PlayPauseButton: React.FC = () => {
    const { bpm, outputChannel, grids, selectedOutput } = useStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const intervalDuration = (60 / bpm) * 1000; // Convert to milliseconds

    const scheduleNotes = useCallback(() => {
        if (!selectedOutput) return;

        grids.forEach((grid, gridIndex) => {
            const notes = grid.notes || [];
            const noteToPlay = notes[currentBeat];

            if (noteToPlay) {
                const noteOnTime = window.performance.now();
                const noteOffTime = noteOnTime + intervalDuration;

                console.log(selectedOutput, 'Grid', gridIndex, 'beat', currentBeat, 'note', NOTE_ON + outputChannel, 'pitch', noteToPlay.pitch);

                selectedOutput.send([NOTE_ON + outputChannel, BASE_PITCH + noteToPlay.pitch, noteToPlay.velocity || 100], noteOnTime);
                selectedOutput.send([NOTE_OFF + outputChannel, BASE_PITCH + noteToPlay.pitch, 0], noteOffTime);
            }

            window.dispatchEvent(new CustomEvent('SET_CURRENT_BEAT', {
                detail: currentBeat
            }));

            setCurrentBeat(currentBeat + 1);
            console.log('tick', currentBeat);
        });
    }, [grids, selectedOutput, outputChannel, intervalDuration, currentBeat]);

    useEffect(() => {
        if (isPlaying && selectedOutput) {
            if (!audioContextRef.current) {
                audioContextRef.current = new window.AudioContext();
            }

            const interval = setInterval(scheduleNotes, intervalDuration);
            return () => {
                if (interval) {
                    clearInterval(interval);
                }
            };
        }
    }, [isPlaying, selectedOutput, scheduleNotes, intervalDuration]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        // On stop, start from the beginning.
        if (!isPlaying) {
            setCurrentBeat(0);
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
