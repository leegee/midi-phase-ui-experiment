// src/components/BPMInput.tsx
import React, { useState } from 'react';

import useMusicStore from '../store';

const BPMInput: React.FC = () => {
    const { bpm, setBPM } = useMusicStore();
    const [inputValue, setInputValue] = useState(bpm.toString());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
    };

    const handleBlur = () => {
        const newBPM = Number(inputValue);
        if (!isNaN(newBPM) && newBPM > 0) {
            setBPM(newBPM);
        }
    };

    return (
        <label>
            BPM:
            <input
                title='Beats per minute'
                className="bpm-input"
                type="number"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                min={1}
                max={300}
            />
        </label>
    );
};

export default BPMInput;
