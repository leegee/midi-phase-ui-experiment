import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GridInput from './GridInput';
import useMusicStore, { type MusicState } from '../store';

jest.mock('../store'); // Mock the Zustand store module

describe('GridInput Integration Test', () => {
    const mockSetGrid = jest.fn();
    const mockUpdateNoteVelocity = jest.fn();
    const mockSetOrUpdateNoteInGrid = jest.fn();

    beforeEach(() => {
        // Clear mock function calls before each test
        jest.clearAllMocks();

        // Mock the Zustand store using type assertions to avoid type errors
        (useMusicStore as unknown as jest.Mock).mockReturnValue({
            grids: [{ beats: [{ notes: {} }], numColumns: 4, colour: 'blue' }],
            setGrid: mockSetGrid,
            updateNoteVelocity: mockUpdateNoteVelocity,
            setOrUpdateNoteInGrid: mockSetOrUpdateNoteInGrid,
        });
    });

    test('renders the grid and toggles a note', () => {
        render(<GridInput gridIndex={0} />); // No need for act here

        // Check if the grid cells are rendered
        const cells = screen.getAllByRole('gridcell');
        expect(cells.length).toBe(88 * 4); // 88 pitches * 4 columns

        // Click on a cell to toggle a note
        const cellToToggle = cells[40]; // Choose an arbitrary cell
        fireEvent.mouseDown(cellToToggle);

        // Verify that the note is added
        expect(mockSetOrUpdateNoteInGrid).toHaveBeenCalledWith(0, expect.any(Number), { pitch: 40, velocity: 100 });
    });

    test('drags a note with CTRL pressed', () => {
        render(<GridInput gridIndex={0} />); // No need for act here

        // Start dragging a note
        const cellToDrag = screen.getAllByRole('gridcell')[40];
        fireEvent.mouseDown(cellToDrag, { ctrlKey: true });

        // Simulate mouse move without using act
        fireEvent.mouseMove(window, { clientY: 50, clientX: 100 }); // Adjust values to simulate dragging

        // Verify that the note's velocity was updated
        expect(mockUpdateNoteVelocity).toHaveBeenCalled();
        expect(mockSetOrUpdateNoteInGrid).toHaveBeenCalled();
    });
});
