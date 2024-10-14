// components/Grids.tsx
import './Grids.css';
import GridInput from './GridInput';
import PianoLegend from './PianoLegend';
import StepInput from './StepInput';

const NUM_GRIDS = 2;

const Grids: React.FC = () => {

    return (
        <section className="grids-component">
            <PianoLegend />

            {Array.from({ length: NUM_GRIDS }).map((_, gridIndex) => (
                <div className="grid-wrapper" key={gridIndex}>
                    <GridInput gridIndex={gridIndex} />
                    <StepInput gridIndex={gridIndex} />
                </div>
            ))}
        </section>
    );
};

export default Grids;
