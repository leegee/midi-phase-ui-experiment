import React from 'react';
import useMusicStore from '../store';

const UndoButton: React.FC = () => {
    const { undo } = useMusicStore();

    const handleUndo = () => {
        undo();
    };

    return (
        <button onClick={handleUndo} >
            Undo
        </button>
    );
};

export default UndoButton;
