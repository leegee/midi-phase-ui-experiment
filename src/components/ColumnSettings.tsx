// src/components/ColumnSettings.tsx
import React from 'react';

interface ColumnSettingsProps {
    gridIndex: number;
    numColumns: number;
    setNumColumns: (num: number) => void;
}

const ColumnSettings: React.FC<ColumnSettingsProps> = ({ gridIndex, numColumns, setNumColumns }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNumColumns = parseInt(e.target.value, 10);
        setNumColumns(newNumColumns);
    };

    return (
        <div>
            <label htmlFor={`num-columns-${gridIndex}`}>
                Columns for Grid {gridIndex + 1}:
            </label>
            <input
                id={`num-columns-${gridIndex}`}
                type="number"
                value={numColumns}
                onChange={handleChange}
                min={1}
            />
        </div>
    );
};

export default ColumnSettings;
