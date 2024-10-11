import React, { useState } from 'react';

interface OutputChannelSelectorProps {
    selectedChannel: number;
    onChange: (channel: number) => void;
}

const OutputChannelSelector: React.FC<OutputChannelSelectorProps> = ({ selectedChannel, onChange }) => {
    const [channel, setChannel] = useState<number>(selectedChannel);

    const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newChannel = parseInt(e.target.value, 10);
        setChannel(newChannel);
        onChange(newChannel);
    };

    return (
        <div>
            <select value={channel} onChange={handleChannelChange}>
                {Array.from({ length: 16 }, (_, i) => i + 1).map(channel => (
                    <option key={channel} value={channel}>
                        Channel {channel}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default OutputChannelSelector;
