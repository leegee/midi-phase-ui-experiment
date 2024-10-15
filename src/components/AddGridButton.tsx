// components/AddGridButton.tsx
import React from 'react';
import useMusicStore from '../store';

const MAX_GRIDS = 10;

interface AddGridButtonProps {
    gridIndex: number;
}

const AddGridButton: React.FC<AddGridButtonProps> = ({ gridIndex }) => {
    const { addGrid, grids } = useMusicStore();

    if (grids.length > MAX_GRIDS) {
        return (<></>);
    }

    const handleAddGrid = () => {
        addGrid(gridIndex);
    };

    return (
        <div className="add-grid">
            <button title='Add a new grid after this one' onClick={handleAddGrid}>New</button>
        </div>
    );
};

export default AddGridButton;
