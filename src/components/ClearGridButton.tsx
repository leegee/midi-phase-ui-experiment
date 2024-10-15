// components/ClearGridButton.tsx
import useMusicStore from '../store';

interface ClearGridButtonProps {
    gridIndex: number;
}


const ClearGridButton: React.FC<ClearGridButtonProps> = ({ gridIndex }) => {
    const { clearGrid } = useMusicStore();

    const confirmAndClearGrid = () => {
        if (window.confirm('Are you sure?')) {
            clearGrid(gridIndex);
        }
    }
    return (
        <button onClick={confirmAndClearGrid}>Clear</button>
    )
}

export default ClearGridButton;