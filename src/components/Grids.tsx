// components/Grids.tsx
import './Grids.css';
import React, { useRef, useEffect } from 'react';
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

    // Refs for the two scrollable areas
    const gridsRef = useRef<HTMLDivElement>(null);
    const mergedGridRef = useRef<HTMLDivElement>(null);

    // Sync scroll positions
    const handleScroll = (sourceRef: React.RefObject<HTMLDivElement>, targetRef: React.RefObject<HTMLDivElement>) => {
        if (targetRef.current) {
            targetRef.current.scrollTop = sourceRef.current!.scrollTop;
            targetRef.current.scrollLeft = sourceRef.current!.scrollLeft;
        }
    };

    useEffect(() => {
        const gridsElement = gridsRef.current;
        const mergedGridElement = mergedGridRef.current;

        if (gridsElement && mergedGridElement) {
            const syncScroll = (e: Event) => handleScroll(gridsRef, mergedGridRef);
            gridsElement.addEventListener('scroll', syncScroll);
            mergedGridElement.addEventListener('scroll', () => handleScroll(mergedGridRef, gridsRef));

            return () => {
                gridsElement.removeEventListener('scroll', syncScroll);
                mergedGridElement.removeEventListener('scroll', () => handleScroll(mergedGridRef, gridsRef));
            };
        }
    }, []);

    return (
        <>
            <section className="grids-component" ref={gridsRef}>
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

            <section className="grids-component" ref={mergedGridRef}>
                <PianoLegend />
                <div className="grid-wrapper">
                    <MergedGrid />
                </div>
            </section>
        </>
    );
};

export default Grids;
