import { Beat, GridNote } from "../store";

export class Grid {
    beats: Beat[];
    numColumns: number;
    colour: string;

    constructor(numColumns: number, colour: string);
    constructor(params: { beats: { notes: Record<number, GridNote> }[]; numColumns: number; colour: string });

    constructor(arg: number | { beats: { notes: Record<number, GridNote> }[]; numColumns: number; colour: string }, colour?: string) {
        if (typeof arg === 'number') {
            this.numColumns = arg;
            this.beats = Array.from({ length: arg }, () => ({ notes: {} }));
            this.colour = colour || 'blue';
        } else {
            this.numColumns = arg.numColumns;
            this.beats = arg.beats;
            this.colour = arg.colour;
        }
    }

    clear() {
        this.beats = [];
    }

    setNumColumns(numColumns: number) {
        this.numColumns = numColumns;
    }

    updateNoteVelocity(beatIndex: number, pitch: number, velocity: number) {
        if (!this.beats[beatIndex]) {
            this.beats[beatIndex] = { notes: {} }; // Create the beat if it doesn't exist
        }

        const beat = this.beats[beatIndex];

        // Update the note velocity in the dictionary
        if (beat.notes[pitch]) {
            beat.notes[pitch].velocity = velocity;
        }
    }

    setOrUpdateNote(beatIndex: number, note: GridNote) {
        if (note.velocity === 0) {
            delete this.beats[beatIndex].notes[note.pitch];
        } else {
            if (!this.beats[beatIndex]) {
                this.beats[beatIndex] = { notes: {} };
            }
            this.beats[beatIndex].notes[note.pitch] = note;
        }
    }

    // Method to double the size of the grid by inserting empty columns
    doubleSize() {
        const newBeats: Beat[] = [];

        // Loop through each beat and insert an empty beat after each one
        this.beats.forEach((beat) => {
            newBeats.push(beat);
            newBeats.push({ notes: {} });
        });

        this.beats = newBeats;
        this.numColumns = newBeats.length;
    }

    // Method to halve the size of the grid, ignoring the final column in grids with an odd number of columns
    halveSize() {
        const newBeats: Beat[] = [];

        // Loop through every second beat
        for (let i = 0; i < this.beats.length; i += 2) {
            newBeats.push(this.beats[i]);
        }

        this.beats = newBeats;
        this.numColumns = newBeats.length;
    }
}
