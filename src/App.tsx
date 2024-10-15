// src/App.tsx
import React from 'react';

import './App.css';
import BPMInput from './components/BPMInput';
import useMIDI from './hooks/useMIDI';
import DeviceSelector from './components/DeviceSelector';
import PlayPauseButton from './components/PlayMIDI';
import Grids from './components/Grids';

const App: React.FC = () => {
  const { error, selectedInput, selectedOutput } = useMIDI();

  return (
    <main>
      <h1>MIDI Phase  Editor</h1>

      {error && <div className="error">{error}</div>}

      {(!selectedInput || !selectedOutput) &&
        <section>
          <p>
            Select an input and output device to continue.
          </p>
          <p>
            Click a grid square to set a note, or use step input.
          </p>
          <p>
            Drag a grid square up/down to change velocity.
          </p>
          <div>
            <DeviceSelector />
          </div>
        </section>
      }

      {!error && selectedInput && selectedOutput && <>

        <section className='app-toolbar'>
          <BPMInput />
          <PlayPauseButton />
          <DeviceSelector />
        </section>

        <Grids />

      </>
      }

    </main>
  );
};

export default App;
