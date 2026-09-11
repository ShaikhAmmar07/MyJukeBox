import { openDB } from 'idb';
import jsmediatags from 'jsmediatags';

const DB_NAME = 'myjukebox-db';
const DB_VERSION = 2;
const SONGS_STORE = 'songs';
const PLAYLISTS_STORE = 'playlists';
const RECENTLY_PLAYED_STORE = 'recentlyPlayed';

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, _oldVersion) {
        if (!db.objectStoreNames.contains(SONGS_STORE)) {
          db.createObjectStore(SONGS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(PLAYLISTS_STORE)) {
          db.createObjectStore(PLAYLISTS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(RECENTLY_PLAYED_STORE)) {
          const rpStore = db.createObjectStore(RECENTLY_PLAYED_STORE, { keyPath: 'id' });
          rpStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

async function safeDBOperation(operation, fallback = null) {
  try {
    return await operation();
  } catch (e) {
    console.error('IndexedDB operation failed:', e);
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      showStorageError('Storage quota exceeded. Please delete some tracks to free up space.');
    } else {
      showStorageError('Database error. Your data may not be saved.');
    }
    return fallback;
  }
}

function showStorageError(message) {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    const event = new CustomEvent('storageError', { detail: { message } });
    window.dispatchEvent(event);
  }
}

function readTags(file) {
  return new Promise((resolve) => {
    try {
      jsmediatags.read(file, {
        onSuccess: (result) => resolve(result.tags || null),
        onError: () => resolve(null),
      });
    } catch (e) {
      console.warn('ID3 read failed:', e);
      resolve(null);
    }
  });
}

function pictureToBase64(picture) {
  if (!picture || !picture.data) return null;
  try {
    const data = picture.data;
    let binary = '';
    if (data instanceof Uint8Array) {
      for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
    } else if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
    }
    return 'data:' + (picture.format || 'image/jpeg') + ';base64,' + btoa(binary);
  } catch (e) {
    return null;
  }
}

export async function fetchItunesDetails(title, artist = '') {
  const term = encodeURIComponent([title, artist].filter(Boolean).join(' '));
  const res = await fetch('https://itunes.apple.com/search?term=' + term + '&media=music&limit=1');
  if (!res.ok) throw new Error('iTunes search failed');
  const json = await res.json();
  if (!json.results || json.results.length === 0) return null;
  const r = json.results[0];
  return {
    title: r.trackName || title,
    artist: r.artistName || artist,
    album: r.collectionName || null,
    year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : null,
    genre: r.primaryGenreName || null,
    coverArt: r.artworkUrl100 ? r.artworkUrl100.replace(/100x100(bb)?/, '600x600$1') : null,
  };
}

function probeDuration(blobUrl) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = blobUrl;
    audio.addEventListener('loadedmetadata', () => {
      resolve(formatSeconds(audio.duration || 0));
    });
    audio.addEventListener('error', () => resolve('0:00'));
    setTimeout(() => resolve('0:00'), 8000);
  });
}

function formatSeconds(sec) {
  const s = Math.round(Number(sec) || 0);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

export async function processUploadedFile(file) {
  const id = 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const url = URL.createObjectURL(file);

  const tags = await readTags(file);
  const picture = pictureToBase64(tags && tags.picture);

  const filenameTitle = file.name.replace(/\.[^.]+$/, '');
  const title = (tags && tags.title) || filenameTitle;
  const artist = (tags && (tags.artist || tags.albumArtist)) || 'Unknown Artist';
  const album = (tags && tags.album) || 'Unknown Album';
  const duration = (tags && tags.duration) ? formatSeconds(tags.duration) : await probeDuration(url);

  const song = {
    id,
    title,
    artist,
    album,
    coverArt: picture || null,
    coverColor: picture ? null : '#9e9e9e',
    year: (tags && tags.year) || null,
    genre: (tags && tags.genre) || 'Unknown',
    duration,
    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    bitrate: '128 kbps',
    rating: 0,
    playCount: 0,
    file: url,
    blobKey: id,
    fileName: file.name,
    local: true,
  };

  await saveSong(song, file);
  return song;
}

export async function saveSong(song, blob) {
  return safeDBOperation(async () => {
    const db = await getDB();
    const { file: _file, ...metadata } = song;
    await db.put(SONGS_STORE, { ...metadata, blob });
  });
}

export async function getAllStoredSongs() {
  return safeDBOperation(async () => {
    const db = await getDB();
    const rows = await db.getAll(SONGS_STORE);
    return rows.map((row) => {
      const { blob, ...song } = row;
      if (blob) {
        try {
          song.file = URL.createObjectURL(blob);
        } catch (e) {
          console.warn('Blob URL recreation failed for', song.id, e);
          song.file = null;
        }
      }
      return song;
    });
  }, []);
}

export async function updateStoredSong(id, updates) {
  return safeDBOperation(async () => {
    const db = await getDB();
    const row = await db.get(SONGS_STORE, id);
    if (!row) return null;
    const { file: _file, ...metadataUpdates } = updates;
    const updated = { ...row, ...metadataUpdates };
    await db.put(SONGS_STORE, updated);
    const { blob, ...song } = updated;
    if (blob) {
      try {
        song.file = URL.createObjectURL(blob);
      } catch (e) {
        console.warn('Blob URL recreation failed for', song.id, e);
        song.file = null;
      }
    }
    return song;
  }, null);
}

export async function deleteStoredSong(id) {
  return safeDBOperation(async () => {
    const db = await getDB();
    const row = await db.get(SONGS_STORE, id);
    if (row && row.file && row.file.startsWith('blob:')) {
      URL.revokeObjectURL(row.file);
    }
    await db.delete(SONGS_STORE, id);
  });
}

// ===== PLAYLIST STORAGE =====
export async function getAllPlaylists() {
  return safeDBOperation(async () => {
    const db = await getDB();
    return db.getAll(PLAYLISTS_STORE);
  }, []);
}

export async function savePlaylist(playlist) {
  return safeDBOperation(async () => {
    const db = await getDB();
    await db.put(PLAYLISTS_STORE, playlist);
  });
}

export async function deletePlaylist(id) {
  return safeDBOperation(async () => {
    const db = await getDB();
    await db.delete(PLAYLISTS_STORE, id);
  });
}

// ===== RECENTLY PLAYED STORAGE =====
export async function addRecentlyPlayed(track) {
  return safeDBOperation(async () => {
    const db = await getDB();
    const entry = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      coverArt: track.coverArt,
      coverColor: track.coverColor,
      duration: track.duration,
      timestamp: Date.now(),
    };
    await db.put(RECENTLY_PLAYED_STORE, entry);
    // Keep only last 20
    const all = await db.getAllFromIndex(RECENTLY_PLAYED_STORE, 'timestamp');
    if (all.length > 20) {
      const toDelete = all.slice(0, all.length - 20);
      for (const item of toDelete) {
        await db.delete(RECENTLY_PLAYED_STORE, item.id);
      }
    }
  });
}

export async function getRecentlyPlayed() {
  return safeDBOperation(async () => {
    const db = await getDB();
    const all = await db.getAllFromIndex(RECENTLY_PLAYED_STORE, 'timestamp');
    return all.reverse(); // Most recent first
  }, []);
}

export async function clearRecentlyPlayed() {
  return safeDBOperation(async () => {
    const db = await getDB();
    await db.clear(RECENTLY_PLAYED_STORE);
  });
}