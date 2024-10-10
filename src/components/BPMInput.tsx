// src/components/BPMInput.tsx
import React, { useState } from 'react';

import useMusicStore from '../store';
import "./BPMInput.css";

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
            setBPM(newBPM); // Update the BPM in the store
        }
    };

    return (
        <div>
            <label>
                BPM:
                <input
                    className="bpm-input"
                    type="number"
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={1}
                    max={300}
                />
            </label>
        </div>
    );
};

export default BPMInput;
