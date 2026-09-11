import { useRef, useEffect, useCallback, useState } from 'react';
import useStore from '../store/useStore';
<<<<<<< HEAD
import { initAudio, resumeAudioContext } from '../audio/audioEngine';
import { songs } from '../data/songs';
import { GoogleGenAI } from '@google/genai';
import { getMoodCompatibleSongs } from '../utils/moodMapper';

export default function PlayerBar({ audioRef }) {
  const { 
    currentSong, isPlaying, library, setIsPlaying, setCurrentSong, incrementPlayCount, rateSong, openModal,
    smartShuffleActive, lastPlayed, addToLastPlayed, toggleSmartShuffle
  } = useStore();
=======
import { initAudio, resumeAudioContext, getByteFrequencyData } from '../audio/audioEngine';

export default function PlayerBar({ audioRef }) {
  const { 
    currentSong, isPlaying, library, playQueue, shuffle, repeat, queueHistory,
    setIsPlaying, setCurrentSong, incrementPlayCount, rateSong, openModal,
    toggleShuffle, setRepeat, playNext, playPrevious
  } = useStore();
  
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  const timeElapsedRef = useRef(null);
  const timeTotalRef = useRef(null);
  const timelineRef = useRef(null);
  const volumeRef = useRef(null);
  const playIconRef = useRef(null);
  const hasIncrementedRef = useRef(false);
<<<<<<< HEAD
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendationText, setRecommendationText] = useState('');

  useEffect(() => {
    if (currentSong) {
      addToLastPlayed(currentSong);
    }
  }, [currentSong?.id, addToLastPlayed]);

  const getAIRecommendation = useCallback(async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('API Key loaded:', !!apiKey);
    if (!apiKey || !currentSong) {
      // Smart fallback: pick from same mood/genre
      const compatible = getMoodCompatibleSongs(currentSong, songs, lastPlayed.map(p => p.id));
      const fallback = compatible.length > 0
        ? compatible[Math.floor(Math.random() * compatible.length)]
        : songs[Math.floor(Math.random() * songs.length)];
      return { nextSong: fallback, reason: "Matches your vibe perfectly!" };
    }

    try {
      const client = new GoogleGenAI({ apiKey });
      
      const prompt = `
Current song: "${currentSong.title}" by ${currentSong.artist}
Genre: ${currentSong.genre}
Mood: ${currentSong.mood}

Library (id, title, artist, genre, mood):
${songs.map(s => `${s.id}: ${s.title} by ${s.artist} (Genre: ${s.genre}, Mood: ${s.mood})`).join("\n")}

Pick the NEXT song that flows best from the current song. Prefer similar mood or complementary genre.
Return ONLY valid JSON: {"nextSongId": song_id, "reason": "one sentence why this fits"}
`;

      console.log('Sending to Gemini:', prompt);

      const result = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      const responseText = result.text ?? '';
      
      let jsonStr = responseText;
      const jsonStart = jsonStr.indexOf('{');
      const jsonEnd = jsonStr.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
      }
      const parsed = JSON.parse(jsonStr);
      
      const nextSong = songs.find(s => s.id === parsed.nextSongId);
      // Verify it's mood-compatible
      if (nextSong && (nextSong.mood === currentSong.mood || nextSong.genre === currentSong.genre)) {
        return { nextSong, reason: parsed.reason };
      }
      // If AI picked incompatible song, use smart fallback
      const compatible = getMoodCompatibleSongs(currentSong, songs, lastPlayed.map(p => p.id));
      const fallback = compatible.length > 0
        ? compatible[Math.floor(Math.random() * compatible.length)]
        : songs[0];
      return { nextSong: fallback, reason: "Flows perfectly from your current track!" };
    } catch (e) {
      console.error("AI error", e);
      // Smart fallback: same mood/genre
      const compatible = getMoodCompatibleSongs(currentSong, songs, lastPlayed.map(p => p.id));
      const fallback = compatible.length > 0
        ? compatible[Math.floor(Math.random() * compatible.length)]
        : songs[Math.floor(Math.random() * songs.length)];
      return { nextSong: fallback, reason: "Matches your vibe perfectly!" };
    }
  }, [currentSong, lastPlayed]);

=======
  const [mediaSessionReady, setMediaSessionReady] = useState(false);

  // Initialize Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        const audio = audioRef.current;
        if (audio) { resumeAudioContext(); audio.play().catch(() => {}); }
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        const audio = audioRef.current;
        if (audio) audio.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        const audio = audioRef.current;
        if (audio && details.seekTime !== undefined) {
          audio.currentTime = details.seekTime;
        }
      });
      setMediaSessionReady(true);
    }
  }, [setIsPlaying, playNext, playPrevious]);

  // Update Media Session metadata when currentSong changes
  useEffect(() => {
    if (!mediaSessionReady || !currentSong) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: currentSong.album || 'Unknown Album',
      artwork: currentSong.coverArt ? [{ src: currentSong.coverArt, sizes: '512x512', type: 'image/png' }] : [],
    });
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [currentSong, isPlaying, mediaSessionReady]);

  // Handle audio source change (only init once)
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

<<<<<<< HEAD
    if (currentSong.file && audio.src !== window.location.origin + currentSong.file) {
      initAudio(audio);
      resumeAudioContext();
      audio.src = currentSong.file;
=======
    const targetSrc = currentSong.file;
    if (targetSrc && audio.src !== targetSrc) {
      initAudio(audio);
      resumeAudioContext();
      audio.src = targetSrc;
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
      hasIncrementedRef.current = false;
      audio.play().then(() => {
        setIsPlaying(true);
        if (!hasIncrementedRef.current) {
          incrementPlayCount(currentSong.id);
          hasIncrementedRef.current = true;
        }
      }).catch(() => {});
    }
  }, [currentSong]);

<<<<<<< HEAD
=======
  // Play/Pause toggle
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { resumeAudioContext(); audio.play().catch(() => {}); }
    else audio.pause();
  }, [isPlaying]);

<<<<<<< HEAD
=======
  // Time updates and ended handling
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (timelineRef.current) timelineRef.current.value = pct;
      if (timeElapsedRef.current) timeElapsedRef.current.textContent = formatTime(audio.currentTime);
<<<<<<< HEAD
=======
      // Update Media Session position
      if (mediaSessionReady) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime,
        });
      }
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
    };
    const onMeta = () => {
      if (timeTotalRef.current) timeTotalRef.current.textContent = formatTime(audio.duration);
    };
<<<<<<< HEAD
    const onEnded = async () => {
      const state = useStore.getState();
      if (state.smartShuffleActive) {
        setAiLoading(true);
        setRecommendationText('🎧 DJ is mixing...');
        // Fake 2-3s delay
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
        const rec = await getAIRecommendation();
        setCurrentSong(rec.nextSong);
        setRecommendationText(`🎧 DJ recommends: ${rec.nextSong.title} - ${rec.reason}`);
        setIsPlaying(true);
        setAiLoading(false);
      } else {
        const lib = state.library;
        const curr = state.currentSong;
        if (curr && lib.length > 0) {
          const idx = lib.findIndex(s => s.id === curr.id);
          const next = lib[(idx + 1) % lib.length];
          state.setCurrentSong(next);
          state.setIsPlaying(true);
        }
      }
=======
    const onEnded = () => {
      // Handle repeat modes
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      playNext();
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
    };
<<<<<<< HEAD
  }, [audioRef]);
=======
  }, [audioRef, repeat, playNext, mediaSessionReady]);
>>>>>>> 8122ee6 (Update MyJukeBox codebase)

  const togglePlayback = useCallback(() => {
    if (!currentSong) {
      if (library.length > 0) { setCurrentSong(library[0]); setIsPlaying(true); }
      return;
    }
    setIsPlaying(!isPlaying);
  }, [currentSong, isPlaying, library]);

  const stopTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setIsPlaying(false);
  }, [audioRef]);

<<<<<<< HEAD
  const prevNext = useCallback(async (dir) => {
    if (library.length === 0 || !currentSong) return;

    if (dir === 1 && smartShuffleActive) {
      // Next with AI
      setAiLoading(true);
      setRecommendationText('🎧 DJ is mixing...');
      // Fake 2-3s delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      const rec = await getAIRecommendation();
      setCurrentSong(rec.nextSong);
      setRecommendationText(`🎧 DJ recommends: ${rec.nextSong.title} - ${rec.reason}`);
      setIsPlaying(true);
      setAiLoading(false);
    } else {
      // Normal prev/next
      const idx = library.findIndex(s => s.id === currentSong.id);
      let next = idx + dir;
      if (next >= library.length) next = 0;
      if (next < 0) next = library.length - 1;
      setCurrentSong(library[next]);
      setIsPlaying(true);
    }
  }, [library, currentSong, smartShuffleActive, getAIRecommendation]);

=======
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  const handleTimeline = (e) => {
    const audio = audioRef.current;
    if (audio && audio.duration) audio.currentTime = (e.target.value / 100) * audio.duration;
  };

  const handleVolume = (e) => {
    const audio = audioRef.current;
    if (audio) audio.volume = e.target.value / 100;
  };

  const handleRatingClick = (e) => {
    if (!currentSong) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    rateSong(currentSong.id, Math.ceil(pct * 5));
  };

<<<<<<< HEAD
  const stars = currentSong ? '★'.repeat(currentSong.rating) + '☆'.repeat(5 - currentSong.rating) : '☆☆☆☆☆';

  return (
    <div className="xp-player-bar">
      <div className="player-track-info">
        <div className="mini-album-art" style={{ background: currentSong?.coverColor || '#ccc' }}>
          <span>{currentSong ? currentSong.title[0] : '♪'}</span>
=======
  const stars = currentSong ? '★'.repeat(currentSong.rating || 0) + '☆'.repeat(5 - (currentSong.rating || 0)) : '☆☆☆☆☆';

  // Repeat button label and class
  const repeatLabels = { off: '⟳', all: '⟳', one: '⟳1' };
  const repeatTitle = { off: 'Repeat Off', all: 'Repeat All', one: 'Repeat One' };

  return (
    <div className="xp-player-bar">
      {/* Left: Album Art + Track Info */}
      <div className="player-track-info">
        <div className="mini-album-art" style={{ background: currentSong?.coverColor || '#ccc' }}>
          {currentSong?.coverArt ? (
            <img src={currentSong.coverArt} alt="" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 3}} />
          ) : (
            <span>{currentSong ? currentSong.title[0] : '♪'}</span>
          )}
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
        </div>
        <div className="mini-track-meta">
          <span className="track-title">{currentSong?.title || 'No track selected'}</span>
          <span className="track-artist">{currentSong?.artist || 'Select a song from Library'}</span>
          <div className="track-extra">
            <span>{currentSong?.bitrate || '192 kbps'}</span>
            <span className="divider">|</span>
            <span className="rating-stars" onClick={handleRatingClick}>{stars}</span>
<<<<<<< HEAD
            {recommendationText && <span className="divider">|</span>}
            {recommendationText && <span style={{ fontSize: '10px', color: '#0066cc' }}>{recommendationText}</span>}
          </div>
        </div>
      </div>
      <div className="player-controls-panel">
        <div className="player-buttons">
          <button className="player-btn" onClick={() => prevNext(-1)} title="Previous"><span>&#9664;&#9664;</span></button>
          <button className="player-btn primary" onClick={togglePlayback} title="Play/Pause"><span ref={playIconRef}>{isPlaying ? '❚❚' : '▶'}</span></button>
          <button className="player-btn" onClick={stopTrack} title="Stop"><span>&#9632;</span></button>
          <button className="player-btn" onClick={(e) => { if (aiLoading) { window.playErrorSound?.(); } else { prevNext(1); } }} title="Next" disabled={aiLoading}>
            {aiLoading ? '...' : '▶▶'}
=======
          </div>
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="player-controls-panel">
        <div className="player-buttons">
          <button 
            className={`player-btn ${shuffle ? 'active' : ''}`} 
            onClick={toggleShuffle} 
            title={shuffle ? 'Shuffle On (Smart)' : 'Shuffle Off'}
          >
            <span>🔀</span>
          </button>
          <button className="player-btn" onClick={playPrevious} title="Previous"><span>&#9664;&#9664;</span></button>
          <button className="player-btn primary" onClick={togglePlayback} title="Play/Pause">
            <span ref={playIconRef}>{isPlaying ? '❚❚' : '▶'}</span>
          </button>
          <button className="player-btn" onClick={stopTrack} title="Stop"><span>&#9632;</span></button>
          <button className="player-btn" onClick={playNext} title="Next"><span>▶▶</span></button>
          <button 
            className={`player-btn ${repeat !== 'off' ? 'active' : ''}`} 
            onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')} 
            title={repeatTitle[repeat]}
          >
            <span>{repeatLabels[repeat]}</span>
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
          </button>
        </div>
        <div className="player-timeline-wrapper">
          <span className="time-elapsed" ref={timeElapsedRef}>0:00</span>
          <div className="xp-slider-container"><input type="range" ref={timelineRef} defaultValue="0" min="0" max="100" step="0.1" onInput={handleTimeline} /></div>
          <span className="time-total" ref={timeTotalRef}>0:00</span>
        </div>
      </div>
<<<<<<< HEAD
      <div className="player-utils-panel">
        <button 
          className={`player-icon-btn ${smartShuffleActive ? 'smart-shuffle-active' : ''}`} 
          onClick={toggleSmartShuffle}
          title="Smart Shuffle"
        >
          🎧 Smart Shuffle
        </button>
=======

      {/* Right: Volume + EQ/Visualizer */}
      <div className="player-utils-panel">
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
        <button className="player-icon-btn" onClick={() => openModal('eq')}>EQ</button>
        <button className="player-icon-btn" onClick={() => openModal('visualizer')}>Visuals</button>
        <div className="player-volume-wrapper">
          <span className="speaker-icon">&#128266;</span>
          <div className="xp-slider-container"><input type="range" ref={volumeRef} defaultValue="70" min="0" max="100" onInput={handleVolume} /></div>
        </div>
      </div>
<<<<<<< HEAD
      <style jsx>{`
        .smart-shuffle-active {
          background: linear-gradient(135deg, #1db954, #1ed760);
          color: white;
          font-weight: bold;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 5px #1db954; }
          50% { box-shadow: 0 0 15px #1db954, 0 0 25px #1ed760; }
        }
      `}</style>
=======
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
    </div>
  );
}

function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
<<<<<<< HEAD
}
=======
}
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
