// components/Grids.tsx
import './Grids.css';
import useMusicStore from '../store';
import GridInput from './GridInput';
import PianoLegend from './PianoLegend';
import StepInput from './StepInput';
import MergedGrid from './MergedGrid.tsc';

const Grids: React.FC = () => {
    const { grids } = useMusicStore();

    return (
        <>
            <section className="grids-component">
                <PianoLegend />

                {Array.from({ length: grids.length }).map((_, gridIndex) => (
                    <>
                        <div className="grid-wrapper" key={gridIndex}>
                            <GridInput gridIndex={gridIndex} />
                        </div>
                        <div className="ctrls-wrapper" key={gridIndex}>
                            <StepInput gridIndex={gridIndex} />
                        </div>
                    </>
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
