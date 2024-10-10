// src/App.tsx
import React from 'react';

import './App.css';
import BPMInput from './components/BPMInput';
import GridInput from './components/GridInput';
import ColumnSettings from './components/ColumnSettings';
import useMIDI from './hooks/useMIDI';

const NUM_GRIDS = 2;

const App: React.FC = () => {
  const { midiAccess, error } = useMIDI();

  return (
    <main>
      <h1>MIDI Phase  Editor</h1>

      {error && <div className="error">{error}</div>}

      <BPMInput />

      <div className="grid-components-container">
        {Array.from({ length: NUM_GRIDS }).map((_, gridIndex) => (
          <section className="grid-input" key={gridIndex}>
            <h3>Phrase {gridIndex + 1}</h3>
            <ColumnSettings gridIndex={gridIndex} />
            <GridInput gridIndex={gridIndex} />
          </section>
        ))}
      </div>

    </main>
  );
};

export default App;
