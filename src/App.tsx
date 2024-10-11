// src/App.tsx
import React from 'react';

import './App.css';
import BPMInput from './components/BPMInput';
import GridInput from './components/GridInput';
import ColumnSettings from './components/ColumnSettings';
import useMIDI from './hooks/useMIDI';
import DeviceSelector from './components/DeviceSelector';
import PlayPauseButton from './components/PlayMIDI';

const NUM_GRIDS = 2;

const App: React.FC = () => {
  const { error, selectedInput, selectedOutput } = useMIDI();

  return (
    <main>
      <h1>MIDI Phase  Editor</h1>

      {error && <div className="error">{error}</div>}

      {(!selectedInput || !selectedOutput) && <div>Select an input and output device to continue.</div>}

      {!error && selectedInput && selectedOutput && <>

        <section className='app-toolbar'>
          <BPMInput />
          <PlayPauseButton />
          <DeviceSelector />
        </section>

        <div className="grid-components-container">
          {Array.from({ length: NUM_GRIDS }).map((_, gridIndex) => (
            <section className="grid-wrapper" key={gridIndex}>
              <ColumnSettings gridIndex={gridIndex} />
              <GridInput gridIndex={gridIndex} />
            </section>
          ))}
        </div>

      </>
      }

    </main>
  );
};

export default App;
