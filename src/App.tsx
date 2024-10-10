// src/App.tsx
import React from 'react';
import BPMInput from './components/BPMInput';
import GridInput from './components/GridInput';
import useMusicStore from './store';

const NUM_GRIDS = 2;

const App: React.FC = () => {
  const { bpm } = useMusicStore();

  return (
    <div style={{ padding: '20px' }}>
      <h1>MIDI Phrase Editor</h1>
      <BPMInput />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1em' }}>
        {Array.from({ length: NUM_GRIDS }).map((_, index) => (
          <GridInput key={index} gridIndex={index} />
        ))}
      </div>
      <p>Current BPM: {bpm}</p>
    </div>
  );
};

export default App;
