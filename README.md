<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
=======
# MyJukeBox

A Windows XP-themed local MP3 player web app. Upload, store, and play your MP3 collection right in your browser.

## Features

- **Windows XP Luna Theme** - Authentic XP visual style with blue, olive, silver, and classic variants
- **Local MP3 Storage** - MP3 files and metadata stored locally in the browser using IndexedDB (no server required)
- **Smart Playback** - Shuffle (with artist separation), Repeat (Off/All/One), and intelligent previous/next logic
- **Playlists** - Create, rename, delete playlists; add/remove tracks; persistent storage
- **Track Management** - Upload MP3s, edit metadata (title, artist, album), fetch details from iTunes API, delete tracks
- **Recently Played** - Automatic history with timestamps, persisted across sessions
- **10-Band Equalizer** - With presets and custom adjustments
- **Music Visualizer** - Multiple visualization modes (Spectrum Bars, Particles, Tunnel, Matrix, Psychedelic)
- **Media Session API** - Lock screen and hardware media key support
- **Keyboard Shortcuts** - Space (play/pause), Arrow keys (seek/volume)
- **Responsive Design** - Works on desktop and mobile while keeping the XP aesthetic
- **Vercel Compatible** - Static deployment, no backend required

## Technology Stack

- React 19 + Vite
- Zustand for state management
- IndexedDB (via `idb`) for local storage
- Web Audio API for EQ and visualization
- `jsmediatags` for ID3 tag parsing
- iTunes Search API for metadata enrichment (free, no key required)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── views/          # Home, Library, Playlists
│   ├── modals/         # All modal dialogs
│   ├── PlayerBar.jsx   # Playback controls
│   ├── MainLayout.jsx  # Main window layout
│   ├── LoginScreen.jsx # Simple login
│   ├── SplashScreen.jsx# Startup splash
│   └── SoundManager.jsx# XP system sounds
├── audio/
│   ├── audioEngine.js  # Web Audio EQ engine
│   └── visualizer.js   # Canvas visualizers
├── utils/
│   └── audioStorage.js # IndexedDB operations
├── store/
│   └── useStore.js     # Zustand store
├── data/
│   └── songs.js        # Bundled demo tracks
├── styles/
│   └── xp-theme.css    # Complete XP theme
└── App.jsx
```

## Storage

All data is stored locally in your browser's IndexedDB:
- `myjukebox-db` database with stores for songs, playlists, and recently played history
- MP3 blobs are stored directly in IndexedDB
- Metadata (title, artist, album, cover art) is stored alongside
- No data ever leaves your browser

## Deployment

Deploy to Vercel (or any static host):

1. Push to GitHub
2. Import repository in Vercel
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

No environment variables or server configuration needed.

## License

MIT License - Feel free to use and modify for personal projects.

## Credits

- Windows XP Luna theme recreation
- React, Vite, Zustand, idb, jsmediatags
- iTunes Search API for metadata
- Public domain / demo MP3 tracks for bundled content
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
