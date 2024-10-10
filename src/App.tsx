// src/App.tsx
import React from 'react';

import './App.css';
import BPMInput from './components/BPMInput';
import GridInput from './components/GridInput';
import ColumnSettings from './components/ColumnSettings';

const NUM_GRIDS = 2;

const App: React.FC = () => {
  return (
    <main style={{ padding: '1em' }}>
      <h1>MIDI Phase  Editor</h1>

      <BPMInput />

      <div className="grid-container">
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
