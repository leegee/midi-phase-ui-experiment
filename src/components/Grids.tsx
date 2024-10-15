// components/Grids.tsx
import './Grids.css';
import React from 'react';
import useMusicStore from '../store';
import GridInput from './GridInput';
import PianoLegend from './PianoLegend';
import StepInput from './StepInput';
import MergedGrid from './MergedGrid.tsc';
import ClearGridButton from './ClearGridButton';
import AddGridButton from './AddGridButton';
import RemoveGridButton from './RemoveGridButton';

const Grids: React.FC = () => {
    const { grids } = useMusicStore();

    return (
        <>
            <section className="grids-component">
                <PianoLegend />

                {Array.from({ length: grids.length }).map((_, gridIndex) => (
                    <React.Fragment key={gridIndex}>
                        <div className="grid-wrapper" key={'grid_' + gridIndex}>
                            <GridInput gridIndex={gridIndex} />
                        </div>
                        <div className="ctrls-wrapper" key={'ctrls_' + gridIndex}>
                            <StepInput gridIndex={gridIndex} />
                            <ClearGridButton gridIndex={gridIndex} />
                            <AddGridButton gridIndex={gridIndex} />
                            <RemoveGridButton gridIndex={gridIndex} />
                        </div>
                    </React.Fragment>
                ))}
            </section>

            <hr />

            <section className="grids-component">
                <PianoLegend />
                <div className="grid-wrapper">
                    <MergedGrid />
                </div>
            </section>
        </>
    );
};

export default Grids;
