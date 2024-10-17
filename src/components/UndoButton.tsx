import React from 'react';
import useMusicStore from '../store';

const UndoButton: React.FC = () => {
    const { undo, undoStack } = useMusicStore();

    const handleUndo = () => {
        undo();
    };

    return (
        <button onClick={handleUndo} disabled={!undoStack.length}>
            Undo
        </button>
    );
};

export default UndoButton;
