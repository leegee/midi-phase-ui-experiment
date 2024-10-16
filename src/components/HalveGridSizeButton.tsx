import React from 'react';
import useMusicStore from '../store';

interface HalveGridSizeButtonProps {
    gridIndex: number;
}

const HalveGridSizeButton: React.FC<HalveGridSizeButtonProps> = ({ gridIndex }) => {
    const { grids, setGrid } = useMusicStore();

    const handleHalveGridSize = () => {
        const grid = grids[gridIndex];

        if (!grid) return;

        grid.halveSize();
        // Update the store with the resized grid
        setGrid(gridIndex, grid);
    };

    return (
        <button onClick={handleHalveGridSize}>
            Halve Size
        </button>
    );
};

export default HalveGridSizeButton;