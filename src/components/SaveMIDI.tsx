import React from 'react';
import { File, type MidiChannel, Track } from 'jsmidgen';
import useMusicStore from '../store';
import { BASE_PITCH } from './PlayMIDI';

function createDataUrlFromBytes(bytes: string, mimeType: string): string {
    // Convert the binary string to a Uint8Array
    const uint8Array = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        uint8Array[i] = bytes.charCodeAt(i);
    }

    const base64String = btoa(String.fromCharCode(...uint8Array));

    return `data:${mimeType};base64,${base64String}`;
}


const SaveMIDIButton: React.FC = () => {
    const { mergedBeats, outputChannel } = useMusicStore();

    const saveAsMIDI = () => {
        const midiFile = new File();
        const track = new Track();
        midiFile.addTrack(track);

        mergedBeats.forEach((beat) => {
            Object.entries(beat.notes).forEach(([pitch, note]) => {
                const midiPitch = pitch + BASE_PITCH;
                track.addNote(outputChannel as MidiChannel, midiPitch, note.velocity || 100);
            });
        });

        const midiBytes = midiFile.toBytes() as unknown as string; // Lib type defs are incorrect
        const mimeType = 'audio/midi';
        const url = createDataUrlFromBytes(midiBytes, mimeType);

        // Create a link to download the MIDI file
        const link = document.createElement('a');
        link.href = url;
        link.download = 'phase-experiment.mid';
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <button onClick={saveAsMIDI}>
            Save MIDI File
        </button>
    );
};

export default SaveMIDIButton;
