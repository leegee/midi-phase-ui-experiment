import React from 'react';
import useMusicStore from '../store';

interface DoubleGridSizeButtonProps {
    gridIndex: number;
}

const DoubleGridSizeButton: React.FC<DoubleGridSizeButtonProps> = ({ gridIndex }) => {
    const { grids, setGrid } = useMusicStore();

    const handleDoubleGridSize = () => {
        const grid = grids[gridIndex];

        if (!grid) return;

        // Call the doubleSize method on the Grid instance
        grid.doubleSize();

        // Update the grid in the store with the new doubled grid
        setGrid(gridIndex, grid);
    };

    return (
        <button onClick={handleDoubleGridSize}>
            Double
        </button>
    );
};

export default DoubleGridSizeButton;
