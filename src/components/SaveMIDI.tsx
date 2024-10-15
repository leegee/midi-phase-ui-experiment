import React from 'react';
import { Midi } from '@tonejs/midi'; // Importing the Midi class from @tonejs/midi
import useMusicStore from '../store';
import { BASE_PITCH } from './PlayMIDI';

const SaveMIDIButton: React.FC = () => {
    const { bpm, mergedBeats } = useMusicStore();

    const saveAsMIDI = () => {
        if (mergedBeats.length === 0) {
            alert("No notes to save!");
            return;
        }

        const midiFile = new Midi();
        midiFile.header.setTempo(bpm);
        const track = midiFile.addTrack();

        let currentBeat = 0;

        mergedBeats.forEach((beat) => {
            const notes = Object.entries(beat.notes);

            notes.forEach(([pitch, note]) => {
                const midiPitch = Number(pitch) + BASE_PITCH;
                track.addNote({
                    midi: midiPitch,
                    time: currentBeat,
                    duration: 1,
                    velocity: note.velocity || 100,
                });
            });

            currentBeat++;
        });

        const midiBytes = midiFile.toArray();
        const mimeType = 'audio/midi';
        const url = createDataUrlFromBytes(midiBytes, mimeType);

        // Create a link to download the MIDI file
        const link = document.createElement('a');
        link.href = url;
        link.download = 'phase-experiment.mid'; // Set the file name
        document.body.appendChild(link);
        link.click(); // Trigger the download

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Revoke the URL to free up memory
    };

    // Helper function to create a data URL from byte array
    function createDataUrlFromBytes(bytes: Uint8Array, mimeType: string): string {
        const base64String = btoa(String.fromCharCode(...bytes)); // Convert bytes to base64 string
        return `data:${mimeType};base64,${base64String}`; // Return the data URL
    }

    return (
        <button onClick={saveAsMIDI}>
            Export MIDI
        </button>
    );
};

export default SaveMIDIButton;
