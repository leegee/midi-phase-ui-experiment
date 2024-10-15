// components/AddGridButton.tsx
import React from 'react';
import useMusicStore from '../store';


interface AddGridButtonProps {
    gridIndex: number;
}

const AddGridButton: React.FC<AddGridButtonProps> = ({ gridIndex }) => {
    const { addGrid } = useMusicStore();

    const handleAddGrid = () => {
        addGrid(gridIndex);
    };

    return (
        <div className="add-grid">
            <button onClick={handleAddGrid}>New Grid</button>
        </div>
    );
};

export default AddGridButton;
