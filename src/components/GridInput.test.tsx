import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import GridInput from './GridInput';
import { vi } from 'vitest';
import { GridNote } from '../store';

// Mock the store and any required props
const mockDefaultVelocity = 78;
const mockSetGrid = vi.fn();
const mockUpdateNoteVelocity = vi.fn();
const mockDeleteNoteFromGrid = vi.fn();
const mockSetOrUpdateNoteInGrid = vi.fn(
    (gridIndex: number, beatIndex: number, newNote: GridNote) => {
        const notes: Record<number, GridNote> = grids[gridIndex].beats[beatIndex].notes;
        if (!notes[newNote.pitch]) {
            notes[newNote.pitch] = newNote;
        } else {
            delete notes[newNote.pitch];
        }
    }
);

const grids = [
    {
        numColumns: 4,
        beats: [
            { notes: {} },
            { notes: {} },
            { notes: {} },
            { notes: {} },
        ],
        colour: '#ff0000',
    },
];

// Mock the store with vi
vi.mock('../store', () => ({
    __esModule: true,
    default: () => ({
        grids,
        setGrid: mockSetGrid,
        updateNoteVelocity: mockUpdateNoteVelocity,
        setOrUpdateNoteInGrid: mockSetOrUpdateNoteInGrid,
        deleteNoteFromGrid: mockDeleteNoteFromGrid,
        defaultVelocity: mockDefaultVelocity
    }),
}));

describe('GridInput Component', () => {
    it('renders the correct number of grid cells', () => {
        const { container } = render(<GridInput gridIndex={0} />);

        // Check that there are the correct number of grid cells
        const cells = container.querySelectorAll('.grid-cell');
        expect(cells.length).toEqual(88 * 4); // 88 pitches * 4 columns
    });

    it('toggles note on mouse down', () => {
        const { container } = render(<GridInput gridIndex={0} />);
        const firstCell = container.querySelector('.grid-cell');

        expect(firstCell).not.toBeNull();

        const expectedPitch = 87;
        const expectedVelocity = mockDefaultVelocity;

        // Simulate mouse down to add a note
        fireEvent.mouseDown(firstCell!);
        expect(mockSetOrUpdateNoteInGrid).toHaveBeenCalledWith(0, 0, { pitch: expectedPitch, velocity: expectedVelocity });

        // Check if the note was actually added to the grid
        expect(grids[0].beats[0].notes).toHaveProperty(expectedPitch.toString()); // Ensure the note is added

        // Simulate mouse down again to remove the note
        fireEvent.mouseDown(firstCell!);
        expect(mockDeleteNoteFromGrid).toHaveBeenCalled(); // Check if the note was removed

        // Check if the note was actually removed from the grid
        expect(grids[0].beats[0].notes).not.toHaveProperty(expectedPitch.toString()); // Ensure the note is removed
    });

});
