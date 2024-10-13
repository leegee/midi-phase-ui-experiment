// components/Grids.tsx
import './Grids.css';
import GridInput from './GridInput';
import PianoLegend from './PianoLegend';

const NUM_GRIDS = 2;

const Grids: React.FC = () => {

    return (
        <section className="grids-component">
            <PianoLegend />

            {Array.from({ length: NUM_GRIDS }).map((_, gridIndex) => (
                <section className="grid-wrapper" key={gridIndex}>
                    <GridInput gridIndex={gridIndex} />
                </section>
            ))}

        </section>
    );
};

export default Grids;
