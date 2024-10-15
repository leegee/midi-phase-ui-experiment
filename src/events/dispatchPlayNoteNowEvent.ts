// events/dispatchPlayNoteNowEvent.ts

export interface PlayNoteNowDetail {
    pitch: number;
    velocity: number;
}

export const PLAY_NOTE_NOW_EVENT_NAME = 'PLAY_NOTE_NOW';

export const dispatchPlayNoteNowEvent = (pitch: number, velocity: number) => {
    const eventDetail: PlayNoteNowDetail = { pitch, velocity };
    window.dispatchEvent(new CustomEvent(PLAY_NOTE_NOW_EVENT_NAME, { detail: eventDetail }));
};
