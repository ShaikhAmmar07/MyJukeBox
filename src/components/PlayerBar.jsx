import { useRef, useEffect, useCallback, useState } from 'react';
import useStore from '../store/useStore';
import { initAudio, resumeAudioContext, getByteFrequencyData } from '../audio/audioEngine';

export default function PlayerBar({ audioRef }) {
  const { 
    currentSong, isPlaying, library, playQueue, shuffle, repeat, queueHistory,
    setIsPlaying, setCurrentSong, incrementPlayCount, rateSong, openModal,
    toggleShuffle, setRepeat, playNext, playPrevious
  } = useStore();
  
  const timeElapsedRef = useRef(null);
  const timeTotalRef = useRef(null);
  const timelineRef = useRef(null);
  const volumeRef = useRef(null);
  const playIconRef = useRef(null);
  const hasIncrementedRef = useRef(false);
  const [mediaSessionReady, setMediaSessionReady] = useState(false);
  const playbackStartedRef = useRef(false);

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
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const targetSrc = currentSong.file;
    if (targetSrc && audio.src !== targetSrc) {
      initAudio(audio);
      resumeAudioContext();
      audio.src = targetSrc;
      hasIncrementedRef.current = false;
      playbackStartedRef.current = false;
      audio.play().then(() => {
        setIsPlaying(true);
        if (!hasIncrementedRef.current) {
          incrementPlayCount(currentSong.id);
          hasIncrementedRef.current = true;
          playbackStartedRef.current = true;
        }
      }).catch(() => {
        // Audio failed to play - don't increment play count
        setIsPlaying(false);
      });
    }
  }, [currentSong]);

  // Play/Pause toggle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { resumeAudioContext(); audio.play().catch(() => { setIsPlaying(false); }); }
    else audio.pause();
  }, [isPlaying]);

  // Time updates and ended handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      if (timelineRef.current) timelineRef.current.value = pct;
      if (timeElapsedRef.current) timeElapsedRef.current.textContent = formatTime(audio.currentTime);
      // Update Media Session position
      if (mediaSessionReady) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime,
        });
      }
    };
    const onMeta = () => {
      if (timeTotalRef.current) timeTotalRef.current.textContent = formatTime(audio.duration);
    };
    const onEnded = () => {
      // Only advance to next track if playback actually started (not just error)
      if (!playbackStartedRef.current) {
        return;
      }
      // Handle repeat modes
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      playNext();
    };
    const onError = () => {
      // Audio failed to load/play - stop and don't increment play count
      playbackStartedRef.current = false;
      setIsPlaying(false);
      // Optionally show error toast
      console.warn('Audio playback error:', audio.error?.message || 'Unknown error');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [audioRef, repeat, playNext, mediaSessionReady]);

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
        </div>
        <div className="mini-track-meta">
          <span className="track-title">{currentSong?.title || 'No track selected'}</span>
          <span className="track-artist">{currentSong?.artist || 'Select a song from Library'}</span>
          <div className="track-extra">
            <span>{currentSong?.bitrate || '192 kbps'}</span>
            <span className="divider">|</span>
            <span className="rating-stars" onClick={handleRatingClick}>{stars}</span>
          </div>
        </div>
      </div>
      <div className="player-controls-panel">

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
            </button>
          </div>
          <div className="player-timeline-wrapper">
            <span className="time-elapsed" ref={timeElapsedRef}>0:00</span>
            <div className="xp-slider-container"><input type="range" ref={timelineRef} defaultValue="0" min="0" max="100" step="0.1" onInput={handleTimeline} /></div>
            <span className="time-total" ref={timeTotalRef}>0:00</span>
          </div>
        </div>

        {/* Right: Volume + EQ/Visualizer */}
        <div className="player-utils-panel">
          <button className="player-icon-btn" onClick={() => openModal('eq')}>EQ</button>
          <button className="player-icon-btn" onClick={() => openModal('visualizer')}>Visuals</button>
          <div className="player-volume-wrapper">
            <span className="speaker-icon">&#128266;</span>
            <div className="xp-slider-container"><input type="range" ref={volumeRef} defaultValue="70" min="0" max="100" onInput={handleVolume} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}