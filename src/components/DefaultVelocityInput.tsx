// src/components/BPMInput.tsx
import React, { useState } from 'react';

import useMusicStore from '../store';

const DefaultVelocityInput: React.FC = () => {
    const { defaultVelocity, setDefaultVelocity } = useMusicStore();
    const [inputValue, setInputValue] = useState(defaultVelocity.toString());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
    };

    const handleBlur = () => {
        const newDefaultVelocity = Number(inputValue);
        if (!isNaN(newDefaultVelocity) && newDefaultVelocity > 0) {
            setDefaultVelocity(newDefaultVelocity);
        }
    };

    return (
        <label>
            Velocity:
            <input
                title='Default velocity'
                type="number"
                value={inputValue}
                onChange={handleChange}
                onBlur={handleBlur}
                min={1}
                max={127}
            />
        </label>
    );
};

export default DefaultVelocityInput;
