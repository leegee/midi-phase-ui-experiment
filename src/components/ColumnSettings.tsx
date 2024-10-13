// src/components/ColumnSettings.tsx
import React, { useState } from 'react';

import useMusicStore from '../store';
import './ColumnSettings.css';

interface ColumnSettingsProps {
    gridIndex: number;
}

const ColumnSettings: React.FC<ColumnSettingsProps> = ({ gridIndex }) => {
    const { grids, setNumColumns } = useMusicStore();
    const grid = grids[gridIndex];

    const [numColumns, setLocalNumColumns] = useState(grid.numColumns);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);
        setLocalNumColumns(value);
        setNumColumns(gridIndex, value);
    };

    return (
        <section className='column-settings-component'>
            <label htmlFor={`num-columns-${gridIndex}`}>Size:</label>
            <input
                className='column-size-input'
                type="number"
                id={`num-columns-${gridIndex}`}
                value={numColumns}
                onChange={handleChange}
                min={1}
                max={32}
            />
        </section>
    );
};

export default ColumnSettings;
