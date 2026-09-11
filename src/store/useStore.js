import { create } from 'zustand';
import { songs } from '../data/songs';
<<<<<<< HEAD

const SPEED_PROFILES = {
  dialup: { name: "Dial-up (56 Kbps)", rate: 7000, display: "7.0 KB/s" },
  dsl: { name: "DSL (512 Kbps)", rate: 64000, display: "64.0 KB/s" },
  cable: { name: "Cable (2.0 Mbps)", rate: 250000, display: "250.0 KB/s" },
  lan: { name: "LAN (10+ Mbps)", rate: 1250000, display: "1.25 MB/s" },
  offline: { name: "Offline Mode", rate: 0, display: "0 KB/s" }
};

export { SPEED_PROFILES };

const useStore = create((set, get) => ({
  // App phase
  appPhase: 'splash', // splash | login | main
  connectionSpeed: 'dsl',
  userName: 'Nikhil_XP',
  
  // Navigation
=======
import { 
  getAllStoredSongs, deleteStoredSong, updateStoredSong, processUploadedFile,
  getAllPlaylists, savePlaylist, deletePlaylist,
  getRecentlyPlayed, addRecentlyPlayed
} from '../utils/audioStorage';

const bundledLibrary = songs.map(song => ({ ...song, bundled: true }));

// Fisher-Yates shuffle with smart artist separation
function smartShuffle(tracks, currentTrackId = null) {
  const shuffled = [...tracks];
  // Fisher-Yates
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Smart: try to avoid same artist consecutively
  for (let i = 1; i < shuffled.length; i++) {
    if (shuffled[i].artist === shuffled[i - 1].artist) {
      // Find a later track with different artist
      for (let j = i + 1; j < shuffled.length; j++) {
        if (shuffled[j].artist !== shuffled[i - 1].artist) {
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          break;
        }
      }
    }
  }
  // If current track is in the queue, move it to the front
  if (currentTrackId) {
    const currentIndex = shuffled.findIndex(t => t.id === currentTrackId);
    if (currentIndex > 0) {
      const currentTrack = shuffled.splice(currentIndex, 1)[0];
      shuffled.unshift(currentTrack);
    }
  }
  return shuffled;
}

const useStore = create((set, get) => ({
  appPhase: 'splash',
  userName: 'MusicLover_XP',
  
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  currentView: 'home',
  viewHistory: ['home'],
  historyIndex: 0,
  
<<<<<<< HEAD
  // Music data
  allSongs: [...songs],
  library: [
    { ...songs[1], downloaded: true },
    { ...songs[6], downloaded: true }
  ],
  playlists: [
    { id: 1, name: "Workout Mix", tracks: [2, 7] },
    { id: 2, name: "Chillout 2006", tracks: [7] }
  ],
  downloads: [],
  
  // Player state
  currentSong: null,
  isPlaying: false,
  playQueue: [],
  
  // Wallet / storage
  walletBalance: 15.00,
  bandwidthUsed: 0.0,
  diskSpaceFree: 74.2,
  
  // Selections
=======
  allSongs: [...songs],
  library: [...bundledLibrary],
  playlists: [
    { id: 1, name: "Workout Mix", tracks: [2, 7], createdAt: Date.now() - 86400000 },
    { id: 2, name: "Chillout 2006", tracks: [7], createdAt: Date.now() - 172800000 }
  ],
  
  // Playback state
  currentSong: null,
  isPlaying: false,
  playQueue: [], // array of track IDs in play order
  queueHistory: [], // stack of played track IDs for previous button
  shuffle: false,
  repeat: 'off', // 'off', 'all', 'one'
  
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  activePlaylistId: null,
  selectedLibraryTrackId: null,
  rightClickedTrackId: null,
  activeTheme: 'luna-blue',
  
<<<<<<< HEAD
  // Modals
  openModals: {},

  // DJ Chat
  djChatHistory: [],

  // Smart Shuffle
  smartShuffleActive: false,
  lastPlayed: [],
  
  // Confirm dialog
  confirmDialog: null,
  
  // Search
  searchQuery: '',
  
  // Details
  selectedAlbumName: null,

  // -- Actions --
  setAppPhase: (phase) => set({ appPhase: phase }),
  
  login: (speed, email) => {
    const userName = (email || 'user').split('@')[0] + "_XP";
    set({ connectionSpeed: speed, userName, appPhase: 'main' });
=======
  openModals: {},
  
  confirmDialog: null,
  
  searchQuery: '',
  
  hasHydrated: false,
  
  setAppPhase: (phase) => set({ appPhase: phase }),
  
  login: (email = '') => {
    const userName = (email || 'user').split('@')[0] + "_XP";
    set({ userName, appPhase: 'main' });
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  },
  
  navigateTo: (view, params = {}) => {
    const state = get();
    let newHistory = state.viewHistory.slice(0, state.historyIndex + 1);
    if (state.currentView !== view) newHistory.push(view);
    set({
      currentView: view,
      viewHistory: newHistory,
      historyIndex: newHistory.length - 1,
<<<<<<< HEAD
      ...(params.selectedAlbumName !== undefined ? { selectedAlbumName: params.selectedAlbumName } : {}),
=======
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
    });
  },
  
  goBack: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      set({ historyIndex: newIndex, currentView: state.viewHistory[newIndex] });
    }
  },
  
  openModal: (id) => set((s) => ({ openModals: { ...s.openModals, [id]: true } })),
  closeModal: (id) => set((s) => { const m = { ...s.openModals }; delete m[id]; return { openModals: m }; }),
  
  showConfirm: (title, message, onConfirm) => set({ confirmDialog: { title, message, onConfirm } }),
  clearConfirm: () => set({ confirmDialog: null }),
  
<<<<<<< HEAD
  // Library management
=======
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  addToLibrary: (song) => set((s) => {
    if (s.library.some(t => t.id === song.id)) return {};
    return { library: [...s.library, { ...song, downloaded: true }] };
  }),
  
<<<<<<< HEAD
  removeFromLibrary: (songId) => set((s) => ({
    library: s.library.filter(t => t.id !== songId),
    selectedLibraryTrackId: s.selectedLibraryTrackId === songId ? null : s.selectedLibraryTrackId,
    currentSong: s.currentSong && s.currentSong.id === songId ? null : s.currentSong,
  })),
=======
  removeFromLibrary: async (songId) => {
    try {
      await deleteStoredSong(songId);
    } catch (e) {
      console.warn('IndexedDB delete failed:', e);
    }
    const state = get();
    // If currently playing this track, stop and move to next
    if (state.currentSong && state.currentSong.id === songId) {
      const currentIndex = state.playQueue.indexOf(songId);
      let nextTrack = null;
      if (currentIndex >= 0 && currentIndex < state.playQueue.length - 1) {
        const nextId = state.playQueue[currentIndex + 1];
        nextTrack = state.library.find(t => t.id === nextId) || state.allSongs.find(t => t.id === nextId);
      }
      set({ 
        isPlaying: false,
        currentSong: nextTrack || null,
        playQueue: state.playQueue.filter(id => id !== songId),
      });
      if (nextTrack) {
        set({ isPlaying: true, currentSong: nextTrack });
      }
    }
    set((s) => ({
      library: s.library.filter(t => t.id !== songId),
      selectedLibraryTrackId: s.selectedLibraryTrackId === songId ? null : s.selectedLibraryTrackId,
      playQueue: s.playQueue.filter(id => id !== songId),
      queueHistory: s.queueHistory.filter(id => id !== songId),
      // Remove from all playlists
      playlists: s.playlists.map(p => ({
        ...p,
        tracks: p.tracks.filter(id => id !== songId)
      })),
    }));
  },
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  
  selectLibraryTrack: (id) => set({ selectedLibraryTrackId: id }),
  setRightClickedTrack: (id) => set({ rightClickedTrackId: id }),
  
<<<<<<< HEAD
  // Playlist management
  createPlaylist: (name) => {
    const id = Date.now();
    set((s) => ({ playlists: [...s.playlists, { id, name, tracks: [] }], activePlaylistId: id }));
    return id;
  },
  renamePlaylist: (id, name) => set((s) => ({
    playlists: s.playlists.map(p => p.id === id ? { ...p, name } : p)
  })),
  deletePlaylist: (id) => set((s) => ({
    playlists: s.playlists.filter(p => p.id !== id),
    activePlaylistId: s.activePlaylistId === id ? null : s.activePlaylistId,
  })),
  addToPlaylist: (playlistId, trackId) => set((s) => ({
    playlists: s.playlists.map(p => p.id === playlistId && !p.tracks.includes(trackId) ? { ...p, tracks: [...p.tracks, trackId] } : p)
  })),
  removeFromPlaylist: (playlistId, trackId) => set((s) => ({
    playlists: s.playlists.map(p => p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t !== trackId) } : p)
  })),
  setActivePlaylist: (id) => set({ activePlaylistId: id }),
  
  // Downloads
  addDownload: (song) => set((s) => {
    if (s.downloads.some(d => d.id === song.id)) return {};
    if (s.library.some(t => t.id === song.id)) return {};
    return {
      downloads: [...s.downloads, {
        id: song.id, songObj: song,
        sizeMB: parseFloat(song.size.replace(' MB', '')),
        bytesDownloaded: 0, progress: 0,
        speed: "Waiting...", eta: "Waiting...", status: "Downloading"
      }]
    };
  }),
  
  updateDownload: (id, updates) => set((s) => ({
    downloads: s.downloads.map(d => d.id === id ? { ...d, ...updates } : d)
  })),
  
  completeDownload: (id) => {
    const state = get();
    const dl = state.downloads.find(d => d.id === id);
    if (!dl) return;
    get().addToLibrary(dl.songObj);
    set((s) => ({
      downloads: s.downloads.filter(d => d.id !== id),
      bandwidthUsed: s.bandwidthUsed + dl.sizeMB,
      diskSpaceFree: s.diskSpaceFree - (dl.sizeMB / 1024),
    }));
  },
  
  cancelDownload: (id) => set((s) => ({ downloads: s.downloads.filter(d => d.id !== id) })),
  
  // Player
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (v) => set({ isPlaying: v }),
=======
  createPlaylist: (name) => {
    const id = 'pl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const playlist = { id, name, tracks: [], createdAt: Date.now() };
    set((s) => ({ playlists: [...s.playlists, playlist], activePlaylistId: id }));
    get().persistPlaylist(playlist);
    return id;
  },
  
  renamePlaylist: (id, name) => {
    set((s) => ({
      playlists: s.playlists.map(p => p.id === id ? { ...p, name } : p)
    }));
    const playlist = get().playlists.find(p => p.id === id);
    if (playlist) get().persistPlaylist(playlist);
  },
  
  deletePlaylist: (id) => {
    set((s) => ({
      playlists: s.playlists.filter(p => p.id !== id),
      activePlaylistId: s.activePlaylistId === id ? null : s.activePlaylistId,
    }));
    get().persistDeletePlaylist(id);
  },
  
  addToPlaylist: (playlistId, trackId) => {
    set((s) => ({
      playlists: s.playlists.map(p => p.id === playlistId && !p.tracks.includes(trackId) 
        ? { ...p, tracks: [...p.tracks, trackId] } 
        : p)
    }));
    const playlist = get().playlists.find(p => p.id === playlistId);
    if (playlist) get().persistPlaylist(playlist);
  },
  
  removeFromPlaylist: (playlistId, trackId) => {
    set((s) => ({
      playlists: s.playlists.map(p => p.id === playlistId 
        ? { ...p, tracks: p.tracks.filter(t => t !== trackId) } 
        : p)
    }));
    const playlist = get().playlists.find(p => p.id === playlistId);
    if (playlist) get().persistPlaylist(playlist);
  },
  
  setActivePlaylist: (id) => set({ activePlaylistId: id }),
  
  persistPlaylist: (playlist) => {
    savePlaylist(playlist).catch(e => console.warn('Failed to persist playlist:', e));
  },
  
  persistDeletePlaylist: (id) => {
    deletePlaylist(id).catch(e => console.warn('Failed to delete playlist from storage:', e));
  },
  
  // Playback actions
  setCurrentSong: (song) => {
    const state = get();
    // If the song is not in the current queue, create a new queue from the library
    if (song && !state.playQueue.includes(song.id)) {
      const queue = state.shuffle ? smartShuffle(state.library, song.id) : state.library;
      set({ currentSong: song, playQueue: queue.map(t => t.id), queueHistory: [] });
    } else {
      set({ currentSong: song });
    }
    // Add to recently played
    if (song) get().addToRecentlyPlayed(song);
  },
  
  setIsPlaying: (v) => set({ isPlaying: v }),
  
  toggleShuffle: () => set((state) => {
    const newShuffle = !state.shuffle;
    let newQueue = state.playQueue;
    if (newShuffle && state.currentSong) {
      const tracks = state.library.filter(t => state.playQueue.includes(t.id));
      newQueue = smartShuffle(tracks, state.currentSong.id).map(t => t.id);
    } else if (!newShuffle && state.currentSong) {
      // Restore original order (library order)
      newQueue = state.library.filter(t => state.playQueue.includes(t.id)).map(t => t.id);
    }
    return { shuffle: newShuffle, playQueue: newQueue };
  }),
  
  setRepeat: (mode) => set({ repeat: mode }), // 'off', 'all', 'one'
  
  playNext: () => {
    const state = get();
    if (!state.currentSong || state.playQueue.length === 0) return;
    
    const currentIndex = state.playQueue.indexOf(state.currentSong.id);
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= state.playQueue.length) {
      if (state.repeat === 'all') {
        nextIndex = 0;
      } else {
        // Stop at end
        set({ isPlaying: false });
        return;
      }
    }
    
    const nextId = state.playQueue[nextIndex];
    const nextTrack = state.library.find(t => t.id === nextId) || state.allSongs.find(t => t.id === nextId);
    if (nextTrack) {
      // Add current to history before moving
      set((s) => ({ queueHistory: [...s.queueHistory, s.currentSong.id] }));
      get().setCurrentSong(nextTrack);
      set({ isPlaying: true });
    }
  },
  
  playPrevious: () => {
    const state = get();
    const audio = document.getElementById('main-audio');
    // If current track played more than 3 seconds, restart it
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    // Otherwise go to previous in history
    if (state.queueHistory.length > 0) {
      const prevId = state.queueHistory[state.queueHistory.length - 1];
      const prevTrack = state.library.find(t => t.id === prevId) || state.allSongs.find(t => t.id === prevId);
      if (prevTrack) {
        set((s) => ({ queueHistory: s.queueHistory.slice(0, -1) }));
        get().setCurrentSong(prevTrack);
        set({ isPlaying: true });
      }
    } else {
      // No history, go to previous in queue
      const currentIndex = state.playQueue.indexOf(state.currentSong.id);
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        if (state.repeat === 'all') {
          prevIndex = state.playQueue.length - 1;
        } else {
          return;
        }
      }
      const prevId = state.playQueue[prevIndex];
      const prevTrack = state.library.find(t => t.id === prevId) || state.allSongs.find(t => t.id === prevId);
      if (prevTrack) {
        get().setCurrentSong(prevTrack);
        set({ isPlaying: true });
      }
    }
  },
  
  addToRecentlyPlayed: async (track) => {
    await addRecentlyPlayed(track);
  },
  
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  incrementPlayCount: (songId) => set((s) => ({
    library: s.library.map(t => t.id === songId ? { ...t, playCount: (t.playCount || 0) + 1 } : t),
    currentSong: s.currentSong && s.currentSong.id === songId ? { ...s.currentSong, playCount: (s.currentSong.playCount || 0) + 1 } : s.currentSong,
  })),
<<<<<<< HEAD
=======
  
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  rateSong: (songId, rating) => set((s) => ({
    library: s.library.map(t => t.id === songId ? { ...t, rating } : t),
    currentSong: s.currentSong && s.currentSong.id === songId ? { ...s.currentSong, rating } : s.currentSong,
  })),
  
<<<<<<< HEAD
  // Wallet
  deductWallet: (amount) => set((s) => ({ walletBalance: Math.max(0, s.walletBalance - amount) })),
  
  // Theme
=======
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  setTheme: (theme) => {
    document.body.className = theme !== 'luna-blue' ? `theme-${theme}` : '';
    set({ activeTheme: theme });
  },
  
<<<<<<< HEAD
  // Search
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedAlbum: (name) => set({ selectedAlbumName: name }),

  // DJ Chat
  addDjChatMessage: (message) => set((state) => ({ djChatHistory: [...state.djChatHistory, message] })),
  clearDjChatHistory: () => set({ djChatHistory: [] }),

  // Smart Shuffle
  toggleSmartShuffle: () => set((state) => ({ smartShuffleActive: !state.smartShuffleActive })),
  addToLastPlayed: (song) => set((state) => {
    const newLastPlayed = [song, ...state.lastPlayed.filter(s => s.id !== song.id)].slice(0, 20);
    return { lastPlayed: newLastPlayed };
  }),
}));

export default useStore;
=======
  setSearchQuery: (q) => set({ searchQuery: q }),
  
  uploadFiles: async (files) => {
    const mp3Files = Array.from(files).filter(f => f.type === 'audio/mpeg' || f.name.toLowerCase().endsWith('.mp3'));
    if (!mp3Files.length) return [];
    const uploaded = [];
    for (const file of mp3Files) {
      try {
        const song = await processUploadedFile(file);
        uploaded.push(song);
      } catch (e) {
        console.error('Upload failed:', file.name, e);
      }
    }
    if (uploaded.length) get().addSongsToLibrary(uploaded);
    return uploaded;
  },
  
  addSongsToLibrary: (newSongs) => set((s) => {
    const existingIds = new Set(s.library.map(t => t.id));
    const unique = newSongs.filter(t => !existingIds.has(t.id));
    return { library: [...s.library, ...unique] };
  }),
  
  updateSongMetadata: async (songId, updates) => {
    const { file: _file, ...metadataUpdates } = updates;
    const row = await updateStoredSong(songId, metadataUpdates).catch(() => null);
    const merged = row || updates;
    set((s) => ({
      library: s.library.map(t => t.id === songId ? { ...t, ...merged } : t),
      currentSong: s.currentSong && s.currentSong.id === songId ? { ...s.currentSong, ...merged } : s.currentSong,
    }));
    return merged;
  },
  
  fetchSongDetails: async (songId) => {
    const track = get().library.find(t => t.id === songId);
    if (!track) return null;
    const { fetchItunesDetails } = await import('../utils/audioStorage');
    const details = await fetchItunesDetails(track.fileName || track.title, track.artist).catch(() => null);
    if (!details) return null;
    return get().updateSongMetadata(songId, details);
  },
  
  hydrateLibrary: async () => {
    if (get().hasHydrated) return;
    try {
      const [stored, storedPlaylists, recent] = await Promise.all([
        getAllStoredSongs(),
        getAllPlaylists(),
        getRecentlyPlayed()
      ]);
      if (stored.length) {
        set((s) => {
          const existingIds = new Set(s.library.map(t => t.id));
          const unique = stored.filter(t => !existingIds.has(t.id));
          return { library: [...s.library, ...unique], hasHydrated: true };
        });
      } else {
        set({ hasHydrated: true });
      }
      // Hydrate playlists
      if (storedPlaylists.length) {
        // Merge with default playlists, avoiding duplicates by ID
        set((s) => {
          const existingIds = new Set(s.playlists.map(p => p.id));
          const unique = storedPlaylists.filter(p => !existingIds.has(p.id));
          return { playlists: [...s.playlists, ...unique] };
        });
      }
    } catch (e) {
      console.warn('Library hydration failed:', e);
      set({ hasHydrated: true });
    }
  },
}));

export default useStore;
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
