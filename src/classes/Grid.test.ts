import { describe, it, expect, beforeEach } from 'vitest';
import { Grid } from './Grid';
import type { Beat, GridNote } from '../store';

describe('Grid Class', () => {
    let grid: Grid;

    beforeEach(() => {
        grid = new Grid(4, 'red'); // Create a new grid with 4 columns and a red color
    });

    it('should initialize correctly with numColumns and colour', () => {
        expect(grid.numColumns).toBe(4);
        expect(grid.colour).toBe('red');
        expect(grid.beats.length).toBe(4);
        expect(grid.beats).toEqual([{ notes: {} }, { notes: {} }, { notes: {} }, { notes: {} }]);
    });

    it('should initialize correctly with beats', () => {
        const beats: Beat[] = [{ notes: { 60: { pitch: 60, velocity: 100 } } }];
        grid = new Grid({ beats, numColumns: 1, colour: 'blue' });
        expect(grid.numColumns).toBe(1);
        expect(grid.colour).toBe('blue');
        expect(grid.beats).toEqual(beats);
    });

    it('should clear all beats', () => {
        grid.clear();
        expect(grid.beats).toEqual([]);
    });

    it('should set number of columns', () => {
        grid.setNumColumns(6);
        expect(grid.numColumns).toBe(6);
    });

    it('should update note velocity', () => {
        // Set the note first
        grid.setOrUpdateNote(0, { pitch: 60, velocity: 10 } as GridNote);
        grid.updateNoteVelocity(0, 60, 80);
        expect(grid.beats[0].notes[60]).toBeDefined();
        expect(grid.beats[0].notes[60].velocity).toBe(80);
    });

    it('should set or update a note', () => {
        const note: GridNote = { pitch: 60, velocity: 120 };
        grid.setOrUpdateNote(0, note);
        expect(grid.beats[0].notes[60]).toEqual(note);

        grid.setOrUpdateNote(0, { pitch: 60, velocity: 0 });
        expect(grid.beats[0].notes[60]).toBeUndefined();
    });

    it('should double the size of the grid', () => {
        grid.doubleSize();
        expect(grid.numColumns).toBe(8);
        expect(grid.beats.length).toBe(8);
    });

    it('should halve the size of the grid', () => {
        grid.doubleSize(); // First double to ensure there are beats to halve
        grid.halveSize();
        expect(grid.numColumns).toBe(4); // Halve should bring it back down to 4
    });

    it('should halve the size of the grid and ignore the final column if odd', () => {
        grid.doubleSize();
        expect(grid.numColumns).toBe(8);
        grid.halveSize();
        expect(grid.numColumns).toBe(4);

        grid.beats.push({ notes: {} });
        grid.halveSize();

        expect(grid.numColumns).toBe(3);
    });
});
