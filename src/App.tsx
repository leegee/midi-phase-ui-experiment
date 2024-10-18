// src/App.tsx
import React from 'react';

import './App.css';
import BPMInput from './components/BPMInput';
import useMIDI from './hooks/useMIDI';
import DeviceSelector from './components/DeviceSelector';
import PlayPauseButton from './components/PlayMIDI';
import Grids from './components/Grids';
import SaveMIDI from './components/SaveMIDI';
import UndoButton from './components/UndoButton';
import DefaultVelocityInput from './components/DefaultVelocityInput';

const App: React.FC = () => {
  const { error, selectedInput, selectedOutput } = useMIDI();

  return (
    <main>
      {error &&
        <>
          <h1>MIDI Phase  Editor: error</h1>
          <div className="error">{error}</div>
        </>
      }

      {(!selectedInput || !selectedOutput) &&
        <section>
          <h1>MIDI Phase  Editor</h1>
          <p>
            Allow the browser access to MIDI devices, and select an input and output device.
          </p>
          <p>
            Click a grid square to set a note, or use step input.
          </p>
          <p>
            Drag a grid from the right to add or remove columns.
          </p>
          <p>
            CTRL-click a grid square to set velocity.
          </p>
          <div>
            <DeviceSelector />
          </div>
        </section>
      }

      {!error && selectedInput && selectedOutput && <>

        <section className='app-toolbar'>
          <h1>MIDI Phase  Editor</h1>
          <nav className='app-ctrls'>
            <PlayPauseButton />
            <BPMInput />
            <DefaultVelocityInput />
            <UndoButton />
            <SaveMIDI />
            <DeviceSelector />
          </nav>
        </section>

        <Grids />
      </>
      }

    </main>
  );
};

export default App;
