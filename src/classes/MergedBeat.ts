import { GridNoteMerged, LIGHTNESS, SATURATION } from "../store";
import { Grid } from "./Grid";

function mergeColors(existingColor: string, newColor: string): string {
    const existingHue = parseHSL(existingColor);
    const newHue = parseHSL(newColor);

    // Merge hue by averaging
    const mergedHSL = {
        hue: (existingHue + newHue) / 2,
        saturation: SATURATION,
        lightness: LIGHTNESS,
    };

    return `hsl(${Math.round(mergedHSL.hue)}, ${Math.round(mergedHSL.saturation)}%, ${Math.round(mergedHSL.lightness)}%)`;
}

function parseHSL(hsl: string): number {
    const regex = /hsl\(\s*(\d+)\s*,/; // Only capture the hue
    const match = hsl.match(regex);
    if (!match) {
        throw new Error('Invalid HSL color format');
    }

    return Number(match[1]); // Return only the hue value
}


export interface MergedBeat {
    notes: Record<number, GridNoteMerged>; // Merged notes indexed by pitch
}

export class MergedBeat {
    notes: Record<number, GridNoteMerged>;

    constructor() {
        this.notes = {};
    }

    mergeWithGridBeat(grid: Grid, beatIndex: number) {
        const beat = grid.beats[beatIndex];
        Object.entries(beat.notes).forEach(([pitch, note]) => {
            const numericPitch = Number(pitch);
            if (!this.notes[numericPitch]) {
                // If the note doesn't exist, create a new entry with the grid's color
                this.notes[numericPitch] = { ...note, colour: grid.colour };
            } else {
                // If the note already exists, merge the colors
                const existingNote = this.notes[numericPitch];
                existingNote.colour = mergeColors(existingNote.colour, grid.colour);
            }
        });
    }
}
