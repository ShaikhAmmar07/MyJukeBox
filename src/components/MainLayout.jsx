import { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import HomeView from './views/HomeView';
import LibraryView from './views/LibraryView';
import PlaylistsView from './views/PlaylistsView';
import PlayerBar from './PlayerBar';
import { EQModal, VisualizerModal, CDBurnerModal, PreferencesModal, PropertiesModal, AboutModal, ConfirmModal, AddToPlaylistModal, EditDetailsModal, StorageErrorToast, PromptModal, DownloadFromUrlModal } from './modals/Modals';

export default function MainLayout() {
  const audioRef = useRef(null);
  const [showShutdown, setShowShutdown] = useState(false);

  // Close context menu on any click
  useEffect(() => {
    const handler = () => {
      const menu = document.getElementById('custom-context-menu');
      if (menu) menu.classList.add('hidden');
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
      
      const state = useStore.getState();
      const audio = audioRef.current;
      
      switch (e.key) {
        case ' ':
          e.preventDefault(); // prevent page scroll
          if (state.currentSong) {
            state.setIsPlaying(!state.isPlaying);
          } else if (state.library.length > 0) {
            state.setCurrentSong(state.library[0]);
            state.setIsPlaying(true);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (audio) audio.currentTime = Math.max(0, audio.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (audio) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (audio) audio.volume = Math.min(1, audio.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (audio) audio.volume = Math.max(0, audio.volume - 0.1);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioRef]);

  const {
    currentView, navigateTo, goBack, userName,
    playlists, openModal, closeModal, showConfirm, createPlaylist, setActivePlaylist,
    historyIndex, searchQuery, setSearchQuery, allSongs, library, setCurrentSong, setIsPlaying, setRightClickedTrack, addToPlaylist, removeFromLibrary
  } = useStore();

  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    if (!searchText.trim()) return;
    navigateTo('library');
    setSearchQuery(searchText.toLowerCase());
  };

  const handleNewPlaylist = () => {
    showPrompt("New Playlist", "Enter Playlist Name:", `New Playlist ${playlists.length + 1}`, (name) => {
      if (name && name.trim()) createPlaylist(name.trim());
    });
  };

  const handleContextAction = (action) => {
    const menu = document.getElementById('custom-context-menu');
    if (menu) menu.classList.add('hidden');
    const state = useStore.getState();
    const trackId = state.rightClickedTrackId;
    const track = state.library.find(t => t.id === trackId);
    if (action === 'play' && track) { setCurrentSong(track); setIsPlaying(true); }
    if (action === 'properties' && track) openModal('properties');
    if (action === 'delete' && track) showConfirm("Delete", `Delete "${track.title}"?`, () => useStore.getState().removeFromLibrary(track.id));
  };

  const handleShutdown = () => {
    window.playXPSound?.('Shutdown.mp3');
    setShowShutdown(true);
  };

  const handleExit = () => {
    showConfirm("Exit", "Close MyJukeBox?", () => setShowShutdown(true));
  };

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'library': return <LibraryView />;
      case 'playlists': return <PlaylistsView />;
      default: return <HomeView />;
    }
  };

  return (
    <>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <div className="main-window xp-window" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="xp-titlebar">
          <span className="xp-titlebar-text">
            <img className="xp-window-icon" src="/favicon.svg" alt="MyJukeBox" />
            MyJukeBox - Your personal MP3 space
          </span>
          <div className="xp-titlebar-controls">
            <button className="xp-btn-min">&#9584;</button>
            <button className="xp-btn-max" disabled>&#9633;</button>
            <button className="xp-btn-close" onClick={handleExit}>&times;</button>
          </div>
        </div>

        <div className="xp-menubar">
          <div className="xp-menu-item"><span>File</span>
            <div className="xp-dropdown-menu">
              <div className="xp-dropdown-item" onClick={() => openModal('cdBurner')}>Import Audio CD...</div>
              <div className="xp-dropdown-item" onClick={() => navigateTo('library')}>Add Files to Library...</div>
              <div className="xp-dropdown-item" onClick={handleNewPlaylist}>New Playlist (Ctrl+N)</div>
              <hr />
              <div className="xp-dropdown-item" onClick={handleExit}>Exit</div>
              <hr />
              <div className="xp-dropdown-item" onClick={handleShutdown} style={{ fontWeight: 'bold', color: '#003399' }}>Shut Down...</div>
            </div>
          </div>
          <div className="xp-menu-item"><span>Edit</span>
            <div className="xp-dropdown-menu">
              <div className="xp-dropdown-item" onClick={() => openModal('preferences')}>Preferences...</div>
            </div>
          </div>
          <div className="xp-menu-item"><span>View</span>
            <div className="xp-dropdown-menu">
              <div className="xp-dropdown-item" onClick={() => navigateTo('home')}>Go to Home</div>
              <div className="xp-dropdown-item" onClick={() => navigateTo('library')}>Go to Library</div>
              <div className="xp-dropdown-item" onClick={() => navigateTo('playlists')}>Go to Playlists</div>
              <hr />
              <div className="xp-dropdown-item" onClick={() => openModal('visualizer')}>Visualizer Window</div>
              <div className="xp-dropdown-item" onClick={() => openModal('eq')}>Equalizer Window</div>
            </div>
          </div>
          <div className="xp-menu-item"><span>Playback</span>
            <div className="xp-dropdown-menu">
              <div className="xp-dropdown-item" onClick={() => { if (useStore.getState().currentSong) useStore.getState().setIsPlaying(!useStore.getState().isPlaying); else if (library.length) { setCurrentSong(library[0]); setIsPlaying(true); } }}>Play/Pause</div>
              <div className="xp-dropdown-item" onClick={() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } setIsPlaying(false); }}>Stop</div>
            </div>
          </div>
          <div className="xp-menu-item"><span>Tools</span>
            <div className="xp-dropdown-menu">
              <div className="xp-dropdown-item" onClick={() => openModal('cdBurner')}>CD Burner...</div>
              <div className="xp-dropdown-item" onClick={() => openModal('preferences')}>Preferences...</div>
            </div>
          </div>
          <div className="xp-menu-item"><span>Help</span>
            <div className="xp-dropdown-menu">
              <div className="xp-dropdown-item" onClick={() => openModal('about')}>About MyJukeBox</div>
            </div>
          </div>
        </div>

        <div className="xp-toolbar">
          <div className="xp-toolbar-buttons">
            <button className="xp-toolbar-btn" onClick={(e) => { if (historyIndex <= 0) { window.playErrorSound?.(); } else { goBack(); } }} disabled={historyIndex <= 0}><span className="icon">&larr;</span> Back</button>
            <div className="xp-toolbar-divider"></div>
            <button className={`xp-toolbar-btn ${currentView === 'home' ? 'active' : ''}`} onClick={() => navigateTo('home')}><span className="icon">&#127968;</span> Home</button>
            <button className={`xp-toolbar-btn ${currentView === 'library' ? 'active' : ''}`} onClick={() => navigateTo('library')}><span className="icon">&#128193;</span> Library</button>
            <button className={`xp-toolbar-btn ${currentView === 'playlists' ? 'active' : ''}`} onClick={() => navigateTo('playlists')}><span className="icon">&#9834;</span> Playlists</button>
            <div className="xp-toolbar-divider"></div>
          </div>
          <div className="xp-toolbar-search">
            <input type="text" placeholder="Search Library..." value={searchText} onChange={e => setSearchText(e.target.value)} onKeyPress={e => { if (e.key === 'Enter') handleSearch(); }} />
            <button className="xp-button search-btn" onClick={handleSearch}>Find</button>
          </div>
        </div>

        <div className="xp-main-body" style={{ flex: 1 }}>
          <div className="xp-sidebar">
            <div className="sidebar-group">
              <div className="sidebar-header">My Music</div>
              <ul className="sidebar-list">
                <li className="sidebar-item" onClick={() => navigateTo('home')}><span className="icon">&#127968;</span> Home</li>
                <li className="sidebar-item" onClick={() => navigateTo('library')}><span className="icon">&#128193;</span> Library</li>
                <li className="sidebar-item" onClick={() => navigateTo('playlists')}><span className="icon">&#9834;</span> Playlists</li>
              </ul>
            </div>
            <div className="sidebar-group">
              <div className="sidebar-header playlist-header-wrapper">
                <span>Playlists</span>
                <button className="xp-mini-btn" onClick={handleNewPlaylist}>+</button>
              </div>
              <ul className="sidebar-list">
                {playlists.map(pl => (
                  <li key={pl.id} className="sidebar-item" onClick={() => { setActivePlaylist(pl.id); navigateTo('playlists'); }}>
                    <span className="icon">&#9834;</span> {pl.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sidebar-group">
              <div className="sidebar-header">Tools</div>
              <ul className="sidebar-list">
                <li className="sidebar-item" onClick={() => openModal('cdBurner')}><span className="icon">&#128191;</span> CD Burner</li>
                <li className="sidebar-item" onClick={() => openModal('eq')}><span className="icon">&#127915;</span> 10-Band EQ</li>
                <li className="sidebar-item" onClick={() => openModal('visualizer')}><span className="icon">&#127916;</span> Visualizer</li>
                <li className="sidebar-item" onClick={() => openModal('preferences')}><span className="icon">&#128295;</span> Preferences</li>
              </ul>
            </div>
          </div>

          <div className="xp-content-pane" id="main-content-pane">
            {renderView()}
          </div>
        </div>

        <PlayerBar audioRef={audioRef} />
      </div>

      <audio ref={audioRef} id="main-audio" preload="auto"></audio>

      <div className="xp-context-menu hidden" id="custom-context-menu">
        <div className="context-item" onClick={() => handleContextAction('play')}>Play</div>
        <div className="context-item" onClick={() => {
          const state = useStore.getState();
          const submenu = document.getElementById('ctx-playlists-submenu');
          if (submenu) {
            submenu.innerHTML = '';
            state.playlists.forEach(pl => {
              const div = document.createElement('div');
              div.className = 'context-item';
              div.textContent = pl.name;
              div.onclick = () => { addToPlaylist(pl.id, state.rightClickedTrackId); document.getElementById('custom-context-menu')?.classList.add('hidden'); };
              submenu.appendChild(div);
            });
          }
        }}>
          Add to Playlist &raquo;
          <div className="context-submenu" id="ctx-playlists-submenu"></div>
        </div>
        <hr />
        <div className="context-item" onClick={() => handleContextAction('burn')}>Burn to CD...</div>
        <div className="context-item" onClick={() => handleContextAction('properties')}>Properties</div>
        <hr />
        <div className="context-item delete" onClick={() => handleContextAction('delete')}>Delete Track</div>
      </div>

      {showShutdown && (
        <div className="xp-shutdown-overlay">
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠</div>
            <h2 style={{ margin: '0 0 20px', fontWeight: 'normal' }}>It's now safe to turn off your computer.</h2>
            <p style={{ margin: '0 0 30px', color: '#aaa' }}>MyJukeBox has been shut down.</p>
            <button
              onClick={() => setShowShutdown(false)}
              className="xp-button primary"
              style={{ padding: '10px 30px', fontSize: '14px' }}
            >
              Return
            </button>
          </div>
        </div>
      )}

      <EQModal />
      <VisualizerModal />
      <CDBurnerModal />
      <PreferencesModal />
      <PropertiesModal />
      <AboutModal />
      <ConfirmModal />
      <AddToPlaylistModal />
      <EditDetailsModal />
      <StorageErrorToast />
      <PromptModal />
      <DownloadFromUrlModal />
    </>
  );
}