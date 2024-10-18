# MIDI Phase Rhythms UI

A React UI to experiment with real-time phasing of MIDI rhythms and first use of zustand.

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

# To Do

* Set cell units?

* Colour grid?

*  MIDI CLock Sync

   * https://steinberg.help/cubase_artist/v10/en/cubase_nuendo/topics/synchronization/synchronization_setup_sync_outputs_r.html

   * https://forum.kemper-amps.com/forum/thread/43271-how-to-send-midi-clock-from-cubase/


# Blah

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
