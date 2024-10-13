import './PianoLegend.css';

const PianoLegend: React.FC = () => {
    const getPianoNotes = () => {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const notes = [];
        const totalKeys = 88;
        const firstNoteIndex = 21; // A0 in MIDI is 21, which corresponds to the first key of a standard piano

        for (let i = 0; i < totalKeys; i++) {
            const noteIndex = (firstNoteIndex + i) % 12; // Find the position within the octave
            const octave = Math.floor((firstNoteIndex + i) / 12); // Determine the octave number
            const noteName = `${noteNames[noteIndex]}${octave}`;
            const isBlack = noteIndex % 12 === 1 || noteIndex % 12 === 3 || noteIndex % 12 === 6 || noteIndex % 12 === 8 || noteIndex % 12 === 10; // Identify black keys

            notes.push({ name: noteName, isBlack });
        }

        return notes;
    };

    const notes = getPianoNotes();

    return (
        <div className="piano-legend">
            {notes.map((note, index) => (
                <div
                    key={index}
                    className={`key ${note.isBlack ? 'black' : 'white'}`}
                >
                    {note.name}
                </div>
            ))}
        </div>
    );
};

export default PianoLegend;
