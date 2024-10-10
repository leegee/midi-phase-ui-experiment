// src/App.tsx
import React from 'react';
import BPMInput from './components/BPMInput';
import GridInput from './components/GridInput';
import useMusicStore from './store';
import './App.css'; // Import the CSS file

const NUM_GRIDS = 2; // Adjust the number of grids as needed

const App: React.FC = () => {
  const { bpm } = useMusicStore();

  return (
    <div style={{ padding: '20px' }}>
      <h1>MIDI Phrase Editor</h1>
      <BPMInput />
      <div className="grid-container">
        {Array.from({ length: NUM_GRIDS }).map((_, index) => (
          <div className="grid-input" key={index}>
            <GridInput gridIndex={index} />
          </div>
        ))}
      </div>
      <p>Current BPM: {bpm}</p>
    </div>
  );
};

export default App;
