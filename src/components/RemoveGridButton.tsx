// components/RemoveGridButton.tsx
import React from 'react';
import useMusicStore from '../store';

interface RemoveGridButtonProps {
    gridIndex: number;
}

const RemoveGridButton: React.FC<RemoveGridButtonProps> = ({ gridIndex }) => {

    const { removeGrid } = useMusicStore();

    if (gridIndex === 0) return (<></>);

    const handleRemoveGrid = () => removeGrid(gridIndex);

    return (
        <div className="remove-grid">
            <button title='Remove this grid' onClick={handleRemoveGrid}>Remove</button>
        </div>
    );
};

export default RemoveGridButton;
