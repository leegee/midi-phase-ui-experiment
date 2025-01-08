# MIDI Phase Rhythms UI

Schillinger's resultants in the studio web browser....

A React UI to experiment with real-time phasing of MIDI rhythms, and first (and last) use of Zustand.

* Allow the browser access to MIDI devices, and select an input and output device.
* Click a grid square to set a note, or use step input.
* Drag a grid from the right to add or remove columns.
* CTRL-click a grid square to set velocity.
* Controls:
   * Play: toggles playback
   * BPM: set the speed
   * Undo: revert the last change to speed or the grid
   * Export: export a standard MIDI file of the combined grids.

[Demo](https://leegee.github.io/midi-phase-ui-experiment/)

![](./README/Screenshot%202024-11-05%20154505.png)

# To Do

* Set cell units?

*  MIDI CLock Sync

   * https://steinberg.help/cubase_artist/v10/en/cubase_nuendo/topics/synchronization/synchronization_setup_sync_outputs_r.html

   * https://forum.kemper-amps.com/forum/thread/43271-how-to-send-midi-clock-from-cubase/


