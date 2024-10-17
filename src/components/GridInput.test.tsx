// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import GridInput from './GridInput';
// import useMusicStore from '../store';

// // Mock the Zustand store module
// jest.mock('../store');

// describe('GridInput Integration Test', () => {
//     const mockSetGrid = jest.fn();
//     const mockUpdateNoteVelocity = jest.fn();
//     const mockSetOrUpdateNoteInGrid = jest.fn();

//     beforeEach(() => {
//         // Clear mock function calls before each test
//         jest.clearAllMocks();

//         jest.mocked(useMusicStore).mockReturnValue({
//             grids: [{ beats: [{ notes: {} }], numColumns: 4, colour: 'blue' }],
//             setGrid: mockSetGrid,
//             updateNoteVelocity: mockUpdateNoteVelocity,
//         });
//     });

//     test('renders the grid and toggles a note', () => {
//         // Render the component
//         render(<GridInput gridIndex={0} />);

//         // Check if the grid cells are rendered
//         const cells = screen.getAllByRole('gridcell');
//         expect(cells.length).toBe(88 * 4); // 88 pitches * 4 columns

//         // Simulate clicking on a grid cell to toggle a note
//         const cellToToggle = cells[40]; // Choose an arbitrary cell
//         fireEvent.mouseDown(cellToToggle);

//         // Verify that the note is added
//         expect(mockSetOrUpdateNoteInGrid).toHaveBeenCalledWith(0, expect.any(Number), {
//             pitch: 40,
//             velocity: 100, // Assuming default velocity
//         });
//     });

//     test('drags a note with CTRL pressed', () => {
//         // Render the component
//         render(<GridInput gridIndex={0} />);

//         // Start dragging a note
//         const cellToDrag = screen.getAllByRole('gridcell')[40];
//         fireEvent.mouseDown(cellToDrag, { ctrlKey: true });

//         // Simulate dragging the note with mouse move
//         fireEvent.mouseMove(window, { clientY: 50, clientX: 100 });

//         // Verify that the note's velocity was updated
//         expect(mockUpdateNoteVelocity).toHaveBeenCalledTimes(1);
//         expect(mockSetOrUpdateNoteInGrid).toHaveBeenCalled();
//     });
// });
