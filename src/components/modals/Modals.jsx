import { useState, useRef, useEffect } from 'react';
import useStore from '../../store/useStore';
import { EQ_FREQUENCIES, EQ_PRESETS, setEQGain, applyPreset, getEQGains } from '../../audio/audioEngine';
import { startVisualizer, stopVisualizer, setVisualizerMode } from '../../audio/visualizer';

const EQ_LABELS = ['60Hz', '170Hz', '310Hz', '600Hz', '1K', '3K', '6K', '12K', '14K', '16K'];

function Modal({ id, title, children, className = '' }) {
  const { openModals, closeModal } = useStore();
  if (!openModals[id]) return null;
  return (
    <div className="xp-modal" onClick={(e) => { if (e.target === e.currentTarget) closeModal(id); }}>
      <div className={`xp-window dialog-window ${className}`}>
        <div className="xp-titlebar">
          <span className="xp-titlebar-text">{title}</span>
          <div className="xp-titlebar-controls">
            <button className="xp-btn-close" onClick={() => closeModal(id)}>&times;</button>
          </div>
        </div>
        <div className="xp-window-body">{children}</div>
      </div>
    </div>
  );
}

// ===== PROMPT MODAL (replaces window.prompt) =====
export function PromptModal() {
  const { openModals, closeModal } = useStore();
  const promptState = openModals.prompt;
  
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (promptState && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [promptState]);

  useEffect(() => {
    if (promptState) {
      setValue(promptState.defaultValue || '');
    }
  }, [promptState]);

  if (!promptState) return null;
  
  const { title, message, onSubmit } = promptState;

  const handleSubmit = (e) => {
    e.preventDefault();
    closeModal('prompt');
    if (onSubmit) onSubmit(value);
  };

  const handleCancel = () => {
    closeModal('prompt');
    if (onSubmit) onSubmit(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(e);
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <Modal id="prompt" title={title} className="prompt-window">
      <div className="props-body" style={{padding: '16px'}}>
        <p style={{marginBottom: '12px'}}>{message}</p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{width: '100%', padding: '4px 6px', border: '1px solid #7f9db9', fontFamily: 'Tahoma, sans-serif', fontSize: '11px'}}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <div className="props-actions" style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px'}}>
            <button type="button" className="xp-button" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="xp-button primary">OK</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export function EQModal() {
  const [preset, setPreset] = useState('Flat');
  const [power, setPower] = useState(true);
  const [gains, setGains] = useState(EQ_FREQUENCIES.map(() => 0));

  const handlePresetChange = (val) => {
    setPreset(val);
    applyPreset(val);
    setGains(getEQGains());
  };

  const handleSliderChange = (idx, val) => {
    if (!power) return;
    setEQGain(idx, val);
    const newGains = [...gains];
    newGains[idx] = val;
    setGains(newGains);
    setPreset('Custom');
  };

  const handleReset = () => { applyPreset('Flat'); setPreset('Flat'); setGains(EQ_FREQUENCIES.map(() => 0)); };
  const handlePower = (on) => {
    setPower(on);
    if (!on) { EQ_FREQUENCIES.forEach((_, i) => setEQGain(i, 0)); setGains(EQ_FREQUENCIES.map(() => 0)); }
    else { const g = getEQGains(); setGains(g); g.forEach((v, i) => setEQGain(i, v)); }
  };

  return (
    <Modal id="eq" title="10-Band Graphic Equalizer" className="eq-window">
      <div className="eq-body">
        <div className="eq-controls-top">
          <div className="checkbox-group">
            <input type="checkbox" checked={power} onChange={e => handlePower(e.target.checked)} id="eq-pwr" />
            <label htmlFor="eq-pwr">Equalizer On</label>
          </div>
          <div className="preset-selector-group">
            <label>Preset:</label>
            <select value={preset} onChange={e => handlePresetChange(e.target.value)}>
              {Object.keys(EQ_PRESETS).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button className="xp-button small" onClick={handleReset}>Reset</button>
        </div>
        <div className="eq-sliders-container">
          {EQ_LABELS.map((label, i) => (
            <div key={i} className="eq-channel-strip">
              <div className="slider-track-vert">
                <input type="range" min="-12" max="12" step="0.5" value={gains[i]} disabled={!power}
                  onChange={e => handleSliderChange(i, parseFloat(e.target.value))}
                  style={{ writingMode: 'vertical-lr', direction: 'rtl', width: 16, height: 120 }} />
              </div>
              <span className="eq-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export function VisualizerModal() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('Spectrum Bars');
  const { openModals } = useStore();

  useEffect(() => {
    if (openModals.visualizer && canvasRef.current) {
      setVisualizerMode(mode);
      startVisualizer(canvasRef.current);
    }
    return () => { if (!openModals.visualizer) stopVisualizer(); };
  }, [openModals.visualizer, mode]);

  return (
    <Modal id="visualizer" title="Music Visualizer v2.1" className="visualizer-window">
      <div className="visualizer-body">
        <div className="vis-controls">
          <div className="selector-group">
            <label>Visual Effect:</label>
            <select value={mode} onChange={e => { setMode(e.target.value); setVisualizerMode(e.target.value); }}>
              <option>Spectrum Bars</option><option>Particles</option><option>Tunnel</option><option>Matrix</option><option>Psychedelic</option>
            </select>
          </div>
          <button className="xp-button small" onClick={() => canvasRef.current?.requestFullscreen?.()}>Toggle Fullscreen</button>
        </div>
        <div className="canvas-container">
          <canvas ref={canvasRef} id="visualizer-canvas" width={600} height={350}></canvas>
        </div>
      </div>
    </Modal>
  );
}

export function CDBurnerModal() {
  const { playlists, library, allSongs, openModal, closeModal, showConfirm } = useStore();
  const [step, setStep] = useState(1);
  const [selectedPl, setSelectedPl] = useState(0);
  const [burnSpeed, setBurnSpeed] = useState('16');
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const trackById = new Map();
  [...library, ...allSongs].forEach(t => { if (!trackById.has(t.id)) trackById.set(t.id, t); });
  const tracks = playlists.find(p => p.id === selectedPl)?.tracks.map(id => trackById.get(id)).filter(Boolean) || [];

  const startBurn = () => {
    if (!tracks.length) { showConfirm("Empty", "Select a playlist with tracks.", null); return; }
    setStep(3); setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(intervalRef.current);
          setTimeout(() => {
            showConfirm("Burn Successful", "CD written successfully.", () => { closeModal('cdBurner'); setStep(1); });
          }, 1200);
          return 100;
        }
        return p + 5;
      });
    }, 1500 / parseInt(burnSpeed));
  };

  const cancelBurn = () => {
    clearInterval(intervalRef.current);
    showConfirm("Aborted", "Burn cancelled.", () => { closeModal('cdBurner'); setStep(1); });
  };

  return (
    <Modal id="cdBurner" title="MyJukeBox CD Burner" className="burner-window">
      <div className="burner-body">
        {step === 1 && (
          <div className="burner-step">
            <h3>Insert Blank CD-R Disc</h3>
            <p>Insert a blank CD-R (700MB / 80 Min) into your CD/DVD drive.</p>
            <div className="drive-anim"><div className="disc-icon rotate-slow">&#128191;</div><div className="drive-tray-label">Drive E: (HL-DT-ST CD-RW)</div></div>
            <div className="burner-actions"><button className="xp-button primary" onClick={() => { setStep(2); if (playlists.length) setSelectedPl(playlists[0].id); }}>Simulate Disc Insert</button></div>
          </div>
        )}
        {step === 2 && (
          <div className="burner-step">
            <h3>Configure Burn Settings</h3>
            <div className="form-grid">
              <div className="form-group"><label>Source Playlist:</label><select value={selectedPl} onChange={e => setSelectedPl(parseInt(e.target.value))}>{playlists.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div className="form-group"><label>Write Speed:</label><select value={burnSpeed} onChange={e => setBurnSpeed(e.target.value)}><option value="4">4x</option><option value="16">16x</option><option value="32">32x</option><option value="48">48x</option></select></div>
            </div>
            <div className="burner-disc-estimate"><strong>Tracks:</strong> {tracks.length} songs | <strong>Est Time:</strong> {Math.ceil(tracks.length * 15 / parseInt(burnSpeed))} mins</div>
            <div className="burner-actions"><button className="xp-button primary" onClick={startBurn}>Burn CD Now</button><button className="xp-button" onClick={() => setStep(1)}>Eject Disc</button></div>
          </div>
        )}
        {step === 3 && (
          <div className="burner-step">
            <h3>{progress >= 100 ? 'Verifying Disc...' : 'Writing Audio Tracks...'}</h3>
            <p>{progress >= 100 ? 'Verification complete. Ejecting...' : `Track ${Math.min(tracks.length, Math.floor((progress / 100) * tracks.length) + 1)} of ${tracks.length}...`}</p>
            <div className="xp-progress-bar"><div className="xp-progress-fill" style={{ width: `${progress}%` }}></div></div>
            <div className="burner-actions"><button className="xp-button" onClick={cancelBurn}>Cancel Burn</button></div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function PreferencesModal() {
  const { activeTheme, setTheme, closeModal } = useStore();
  const [tab, setTab] = useState('tab-general');
  const [theme, setLocalTheme] = useState(activeTheme);

  const apply = () => setTheme(theme);
  const tabs = ['tab-general', 'tab-playback', 'tab-appearance'];
  const tabLabels = ['General', 'Playback', 'Appearance'];

  return (
    <Modal id="preferences" title="MyJukeBox Preferences" className="prefs-window">
      <div className="prefs-body">
        <div className="xp-tabs">
          <div className="xp-tab-headers">
            {tabs.map((t, i) => <button key={t} className={`xp-tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{tabLabels[i]}</button>)}
          </div>
          <div className={`xp-tab-content ${tab === 'tab-general' ? 'active' : ''}`} id="tab-general">
            <h4>Startup Options</h4>
            <div className="checkbox-group"><input type="checkbox" defaultChecked id="pref-launch" /><label htmlFor="pref-launch">Launch MyJukeBox on startup</label></div>
            <div className="checkbox-group"><input type="checkbox" id="pref-tray" /><label htmlFor="pref-tray">Minimize to system tray</label></div>
            <hr /><h4>Language</h4>
            <div className="form-group"><label>Language:</label><select defaultValue="en"><option value="en">English</option><option value="es">Español</option><option value="de">Deutsch</option></select></div>
          </div>
          <div className={`xp-tab-content ${tab === 'tab-playback' ? 'active' : ''}`}>
            <h4>Audio Hardware</h4>
            <div className="form-group"><label>Output:</label><select defaultValue="primary"><option value="primary">Primary Sound Driver</option><option>DirectSound: Realtek AC97</option></select></div>
            <div className="form-group"><label>Buffer:</label><select defaultValue="2000"><option>500ms</option><option>1000ms</option><option>2000ms</option><option>5000ms</option></select></div>
          </div>
          <div className={`xp-tab-content ${tab === 'tab-appearance' ? 'active' : ''}`}>
            <h4>Themes</h4>
            <div className="form-group"><label>Visual Style:</label>
              <select value={theme} onChange={e => setLocalTheme(e.target.value)}>
                <option value="luna-blue">Windows XP Luna (Blue)</option>
                <option value="luna-olive">Windows XP Luna (Olive)</option>
                <option value="luna-silver">Windows XP Luna (Silver)</option>
                <option value="retro-classic">Windows 98 Classic</option>
              </select>
            </div>
          </div>
        </div>
        <div className="prefs-actions">
          <button className="xp-button primary" onClick={() => { apply(); closeModal('preferences'); }}>OK</button>
          <button className="xp-button" onClick={() => closeModal('preferences')}>Cancel</button>
          <button className="xp-button" onClick={apply}>Apply</button>
        </div>
      </div>
    </Modal>
  );
}

export function PropertiesModal() {
  const { rightClickedTrackId, allSongs, library } = useStore();
  const track = library.find(t => t.id === rightClickedTrackId) || allSongs.find(t => t.id === rightClickedTrackId);
  if (!track) return null;

  const isLocal = track.local;
  const location = isLocal ? 'IndexedDB (browser storage)' : (track.file?.startsWith('/songs/') ? 'Bundled library (public/songs)' : 'Local file');

  return (
    <Modal id="properties" title={`${track.title} Properties`} className="props-window">
      <div className="props-body">
        <div className="props-tab-header">General File Info</div>
        <div className="props-row"><span className="label">File Name:</span><span className="value">{track.fileName || track.id + '.mp3'}</span></div>
        <div className="props-row"><span className="label">Location:</span><span className="value">{location}</span></div>
        <hr />
        <div className="props-row"><span className="label">Title:</span><span className="value">{track.title}</span></div>
        <div className="props-row"><span className="label">Artist:</span><span className="value">{track.artist}</span></div>
        <div className="props-row"><span className="label">Album:</span><span className="value">{track.album}</span></div>
        <div className="props-row"><span className="label">Year:</span><span className="value">{track.year}</span></div>
        <div className="props-row"><span className="label">Genre:</span><span className="value">{track.genre}</span></div>
        <hr />
        <div className="props-row"><span className="label">Length:</span><span className="value">{track.duration}</span></div>
        <div className="props-row"><span className="label">Bitrate:</span><span className="value">{track.bitrate}</span></div>
        <div className="props-row"><span className="label">Size:</span><span className="value">{track.size}</span></div>
        <div className="props-actions"><button className="xp-button primary" onClick={() => useStore.getState().closeModal('properties')}>Close</button></div>
      </div>
    </Modal>
  );
}

export function AboutModal() {
  return (
    <Modal id="about" title="About MyJukeBox" className="about-window">
      <div className="about-body">
        <img className="about-logo" src="/favicon.svg" alt="MyJukeBox" style={{width: 48, height: 48}} />
        <h3>MyJukeBox</h3>
        <p>Version 1.0.0 (Build XP)</p>
        <p>Copyright &copy; 2026 MyJukeBox. All rights reserved.</p>
        <hr />
        <p>Your personal MP3 space. Upload, store and play your MP3 collection right in your browser.</p>
        <div className="about-actions"><button className="xp-button primary" onClick={() => useStore.getState().closeModal('about')}>OK</button></div>
      </div>
    </Modal>
  );
}

export function ConfirmModal() {
  const { confirmDialog, clearConfirm } = useStore();
  if (!confirmDialog) return null;

  return (
    <div className="xp-modal">
      <div className="xp-window dialog-window confirm-window">
        <div className="xp-titlebar">
          <span className="xp-titlebar-text">{confirmDialog.title}</span>
          <div className="xp-titlebar-controls"><button className="xp-btn-close" onClick={clearConfirm}>&times;</button></div>
        </div>
        <div className="xp-window-body confirm-body">
          <div className="confirm-content-row">
            <span className="confirm-warning-icon">&#9888;</span>
            <p>{confirmDialog.message}</p>
          </div>
          <div className="confirm-actions">
            <button className="xp-button primary" onClick={() => { if (confirmDialog.onConfirm) confirmDialog.onConfirm(); clearConfirm(); }}>Yes</button>
            <button className="xp-button" onClick={clearConfirm}>No</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== NEW MODALS FOR PHASE 3 =====

export function AddToPlaylistModal() {
  const { rightClickedTrackId, playlists, closeModal, showConfirm, createPlaylist, addToPlaylist, persistPlaylist } = useStore();
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const track = useStore.getState().library.find(t => t.id === rightClickedTrackId) || 
                useStore.getState().allSongs.find(t => t.id === rightClickedTrackId);
  
  if (!track) return null;

  // Check which playlists already contain this track
  const trackInPlaylist = new Set();
  playlists.forEach(pl => {
    if (pl.tracks.includes(track.id)) trackInPlaylist.add(pl.id);
  });

  const handleAddToSelected = (playlistId, checked) => {
    if (checked) {
      // Add to playlist
      addToPlaylist(playlistId, track.id);
      // Persist immediately
      const updatedPlaylist = playlists.find(p => p.id === playlistId);
      if (updatedPlaylist) {
        persistPlaylist({ ...updatedPlaylist, tracks: [...updatedPlaylist.tracks, track.id] });
      }
    } else {
      // Remove from playlist
      const updatedPlaylist = playlists.find(p => p.id === playlistId);
      if (updatedPlaylist) {
        const newTracks = updatedPlaylist.tracks.filter(id => id !== track.id);
        // We need to update the store directly for removal
        useStore.setState(s => ({
          playlists: s.playlists.map(p => p.id === playlistId ? { ...p, tracks: newTracks } : p)
        }));
        persistPlaylist({ ...updatedPlaylist, tracks: newTracks });
      }
    }
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylistName.trim()) return;
    const id = useStore.getState().createPlaylist(newPlaylistName.trim());
    addToPlaylist(id, track.id);
    closeModal('addToPlaylist');
    setNewPlaylistName('');
  };

  const handleClose = () => {
    closeModal('addToPlaylist');
  };

  if (playlists.length === 0) {
    return (
      <Modal id="addToPlaylist" title={`Add "${track.title}" to Playlist`} className="props-window">
        <div className="props-body" style={{padding: '16px'}}>
          <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
            <p style={{marginBottom: '8px', fontWeight: 'bold'}}>No playlists yet</p>
            <p>You don't have any playlists yet. Go to the Playlists tab to create one!</p>
            <div style={{marginTop: '16px'}}>
              <button className="xp-button" onClick={handleClose}>OK</button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal id="addToPlaylist" title={`Add "${track.title}" to Playlist`} className="props-window">
      <div className="props-body" style={{padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '300px'}}>
        <div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
          <p style={{fontWeight: 'bold', marginBottom: '8px', marginTop: 0}}>Select playlist(s):</p>
          <div style={{flex: 1, maxHeight: '250px', overflowY: 'auto', border: '1px solid #e0ddd0', borderRadius: '3px'}}>
            {playlists.map(pl => {
              const isInPlaylist = trackInPlaylist.has(pl.id);
              return (
                <label key={pl.id} className="playlist-checkbox-item" style={{display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: isInPlaylist ? 'not-allowed' : 'pointer', borderBottom: '1px solid #e0ddd0', background: isInPlaylist ? '#f5f5f5' : 'white', gap: '8px'}}>
                  <input 
                    type="checkbox" 
                    checked={isInPlaylist}
                    disabled={isInPlaylist}
                    onChange={(e) => handleAddToSelected(pl.id, e.target.checked)}
                    style={{marginRight: '8px', width: '16px', height: '16px', accentColor: '#0066cc'}}
                  />
                  <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {pl.name} ({pl.tracks.length} tracks)
                  </span>
                  {isInPlaylist && (
                    <span style={{color: '#666', fontSize: '10px', fontStyle: 'italic', whiteSpace: 'nowrap'}}>
                      Already added
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
        <hr style={{margin: '12px 0'}} />
        <div style={{marginTop: 'auto', paddingTop: '8px'}}>
          <h4 style={{marginBottom: '8px', marginTop: 0}}>Or create new playlist:</h4>
          <div style={{display: 'flex', gap: '8px'}}>
            <input 
              type="text" 
              value={newPlaylistName} 
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name"
              style={{flex: 1, padding: '4px 6px', border: '1px solid #7f9db9', fontFamily: 'Tahoma, sans-serif', fontSize: '11px'}}
            />
            <button className="xp-button primary" onClick={handleCreateAndAdd} disabled={!newPlaylistName.trim()}>Create & Add</button>
          </div>
          <div className="props-actions" style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px'}}>
            <button className="xp-button" onClick={handleClose}>Cancel</button>
            <button className="xp-button primary" onClick={handleClose}>Done</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function EditDetailsModal() {
  const { rightClickedTrackId, allSongs, library, closeModal, updateSongMetadata, showConfirm } = useStore();
  const track = library.find(t => t.id === rightClickedTrackId) || allSongs.find(t => t.id === rightClickedTrackId);
  
  const [title, setTitle] = useState(track?.title || '');
  const [artist, setArtist] = useState(track?.artist || '');
  const [album, setAlbum] = useState(track?.album || '');
  const [saving, setSaving] = useState(false);
  
  if (!track) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      showConfirm("Invalid Title", "Title cannot be empty.", null);
      return;
    }
    setSaving(true);
    try {
      const updates = {
        title: title.trim(),
        artist: artist.trim() || 'Unknown Artist',
        album: album.trim() || 'Unknown Album',
      };
      await updateSongMetadata(track.id, updates);
      closeModal('editDetails');
    } catch (e) {
      showConfirm("Error", "Failed to save changes.", null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal id="editDetails" title={`Edit: ${track.title}`} className="props-window">
      <div className="props-body" style={{padding: '16px'}}>
        <div className="form-group" style={{marginBottom: '12px'}}>
          <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Title:</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            style={{width: '100%', padding: '4px 6px', border: '1px solid #7f9db9', fontFamily: 'Tahoma, sans-serif', fontSize: '11px'}}
          />
        </div>
        <div className="form-group" style={{marginBottom: '12px'}}>
          <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Artist:</label>
          <input 
            type="text" 
            value={artist} 
            onChange={e => setArtist(e.target.value)}
            style={{width: '100%', padding: '4px 6px', border: '1px solid #7f9db9', fontFamily: 'Tahoma, sans-serif', fontSize: '11px'}}
          />
        </div>
        <div className="form-group" style={{marginBottom: '12px'}}>
          <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>Album:</label>
          <input 
            type="text" 
            value={album} 
            onChange={e => setAlbum(e.target.value)}
            style={{width: '100%', padding: '4px 6px', border: '1px solid #7f9db9', fontFamily: 'Tahoma, sans-serif', fontSize: '11px'}}
          />
        </div>
        <div className="props-actions" style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px'}}>
          <button className="xp-button" onClick={() => closeModal('editDetails')}>Cancel</button>
          <button className="xp-button primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </Modal>
  );
}

export function StorageErrorToast() {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handleStorageError = (event) => {
      setError(event.detail.message);
      setTimeout(() => setError(null), 5000);
    };
    window.addEventListener('storageError', handleStorageError);
    return () => window.removeEventListener('storageError', handleStorageError);
  }, []);
  
  if (!error) return null;
  
  return (
    <div className="xp-storage-error-toast" style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#fff',
      border: '2px solid #d32f2f',
      borderRadius: '4px',
      padding: '12px 20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 9999,
      maxWidth: '400px',
      textAlign: 'center'
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
        <span style={{color: '#d32f2f', fontSize: '18px'}}>⚠</span>
        <span style={{color: '#d32f2f', fontWeight: 'bold', fontSize: '11px'}}>{error}</span>
      </div>
    </div>
  );
}

// ===== DOWNLOAD FROM URL MODAL =====
export function DownloadFromUrlModal() {
  const { closeModal, showConfirm, uploadFiles } = useStore();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [blobToUpload, setBlobToUpload] = useState(null);

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  const validateUrl = (inputUrl) => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return { valid: false, error: 'Please enter a URL.' };
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, error: 'URL must use http:// or https://' };
      }
      if (isHttps && parsed.protocol === 'http:') {
        return { valid: false, error: 'Blocked: insecure (http) link on a secure site.' };
      }
      return { valid: true, url: parsed.href };
    } catch {
      return { valid: false, error: 'Invalid URL format.' };
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSizeWarning(false);
    setBlobToUpload(null);
    
    try {
      const response = await fetch(validation.url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      const isAudio = contentType.startsWith('audio/') || 
                      /\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(validation.url);
      
      if (!isAudio) {
        throw new Error('This URL did not return an audio file.');
      }
      
      const blob = await response.blob();
      
      // Size guard: 50MB
      if (blob.size > 50 * 1024 * 1024) {
        setSizeWarning(true);
        setBlobToUpload(blob);
        setError(`File is ${(blob.size / (1024 * 1024)).toFixed(1)} MB (max 50 MB).`);
        setLoading(false);
        return;
      }
      
      // Upload via existing pipeline
      const file = new File([blob], validation.url.split('/').pop() || 'download.mp3', { type: blob.type || 'audio/mpeg' });
      const uploaded = await uploadFiles([file]);
      
      if (uploaded && uploaded[0]) {
        closeModal('downloadFromUrl');
        showConfirm("Download Complete", `"${uploaded[0].title}" has been added to your library.`, null);
      } else {
        throw new Error('Upload pipeline returned no track.');
      }
    } catch (e) {
      // CORS errors typically appear as TypeError with "Failed to fetch"
      if (e.name === 'TypeError' && e.message.includes('fetch')) {
        setError('Download blocked by browser security (CORS). Please download the file to your computer first, then use the Upload button.');
      } else {
        setError(e.message || 'Failed to download. Please check the URL and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLargeUpload = async () => {
    if (!blobToUpload) return;
    setSizeWarning(false);
    setLoading(true);
    try {
      const file = new File([blobToUpload], url.split('/').pop() || 'download.mp3', { type: blobToUpload.type || 'audio/mpeg' });
      const uploaded = await uploadFiles([file]);
      if (uploaded && uploaded[0]) {
        closeModal('downloadFromUrl');
        showConfirm("Download Complete", `"${uploaded[0].title}" has been added to your library.`, null);
      }
    } catch (e) {
      setError(e.message || 'Failed to save file.');
    } finally {
      setLoading(false);
      setBlobToUpload(null);
    }
  };

  return (
    <Modal id="downloadFromUrl" title="Download from URL" className="props-window">
      <div className="props-body" style={{padding: '16px'}}>
        <p style={{marginBottom: '12px', fontSize: '11px', color: '#666'}}>
          Paste a direct link to an MP3 file. The file will be downloaded and added to your library.
        </p>
        <form onSubmit={handleDownload}>
          <div className="form-group" style={{marginBottom: '12px'}}>
            <label style={{display: 'block', marginBottom: '4px', fontWeight: 'bold'}}>
              MP3 URL:
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/song.mp3"
              disabled={loading}
              style={{width: '100%', padding: '4px 6px', border: '1px solid #7f9db9', fontFamily: 'Tahoma, sans-serif', fontSize: '11px'}}
            />
          </div>
          {error && !sizeWarning && (
            <div style={{background: '#ffe0e0', border: '1px solid #d32f2f', padding: '8px', marginBottom: '12px', borderRadius: '3px', color: '#d32f2f', fontSize: '11px'}}>
              {error}
            </div>
          )}
          {sizeWarning && (
            <div style={{background: '#fff3e0', border: '1px solid #ff9800', padding: '12px', marginBottom: '12px', borderRadius: '3px', color: '#e65100', fontSize: '11px'}}>
              <p><strong>Large file detected:</strong> {error}</p>
              <p>Do you want to continue downloading and saving this file?</p>
              <div style={{display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px'}}>
                <button type="button" className="xp-button" onClick={() => { setSizeWarning(false); setBlobToUpload(null); }}>Cancel</button>
                <button type="button" className="xp-button primary" onClick={handleConfirmLargeUpload}>Continue Anyway</button>
              </div>
            </div>
          )}
          <div className="props-actions" style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
            <button type="button" className="xp-button" onClick={() => { closeModal('downloadFromUrl'); setBlobToUpload(null); }} disabled={loading}>Cancel</button>
            <button type="submit" className="xp-button primary" disabled={loading || !url.trim()}>
              {loading ? 'Downloading...' : 'Download'}
            </button>
          </div>
        </form>
        {loading && !sizeWarning && (
          <div style={{marginTop: '12px', textAlign: 'center'}}>
            <div className="xp-progress-bar" style={{width: '100%'}}>
              <div className="xp-progress-fill" style={{width: '100%', animation: 'xp-progress-anim 1s linear infinite'}}></div>
            </div>
            <p style={{marginTop: '8px', fontSize: '11px', color: '#666'}}>Downloading file...</p>
          </div>
        )}
      </div>
    </Modal>
  );
}