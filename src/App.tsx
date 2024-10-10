// src/App.tsx
import React from 'react';
import BPMInput from './components/BPMInput';
import GridInput from './components/GridInput';

const NUM_GRIDS = 2; // Set the number of grids (can be adjusted in the future)

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Minimalist Music App</h1>

      {/* BPM Input Component */}
      <BPMInput />

      {/* Render multiple GridInput components */}
      {Array.from({ length: NUM_GRIDS }).map((_, index) => (
        <GridInput key={index} gridIndex={index} />
      ))}

      {/* Placeholder for Combined View */}
      <div>
        <h2>Combined View (Coming Soon)</h2>
      </div>
    </div>
  );
};

export default App;
