import React from 'react';

interface InputChannelSelectorProps {
    selectedChannels: number[];
    onChange: (channels: number[]) => void;
}

const InputChannelSelector: React.FC<InputChannelSelectorProps> = ({ selectedChannels, onChange }) => {

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
        onChange(selectedOptions); // Update the parent component with selected channels
    };

    return (
        <div>
            <select multiple value={selectedChannels.map(channel => channel.toString())} onChange={handleSelectChange}>
                {Array.from({ length: 16 }, (_, i) => i).map(channel => (
                    <option key={channel} value={channel}>
                        Channel {channel + 1}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default InputChannelSelector;
