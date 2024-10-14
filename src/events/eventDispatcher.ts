// events/eventDispatcher.ts

export const dispatchCurrentBeatEvent = (currentBeat: number) => {
    window.dispatchEvent(new CustomEvent('SET_CURRENT_BEAT', { detail: currentBeat }));
};
