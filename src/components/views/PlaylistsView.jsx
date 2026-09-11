import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';

export default function PlaylistsView() {
  const { 
    playlists, activePlaylistId, allSongs, library, 
    setActivePlaylist, renamePlaylist, deletePlaylist, 
    removeFromPlaylist, navigateTo, openModal, 
    setCurrentSong, setIsPlaying, showConfirm, showPrompt,
    toggleShuffle
  } = useStore();

  const playlist = playlists.find(p => p.id === activePlaylistId);
  const showList = !playlist;

  const trackById = useMemo(() => {
    const map = new Map();
    [...library, ...allSongs].forEach(t => { if (!map.has(t.id)) map.set(t.id, t); });
    return map;
  }, [library, allSongs]);

  if (showList) {
    // Playlist list view
    const handleCreatePlaylist = () => {
      showPrompt("New Playlist", "Enter Playlist Name:", `My Playlist ${playlists.length + 1}`, (name) => {
        if (name && name.trim()) {
          const id = useStore.getState().createPlaylist(name.trim());
          setActivePlaylist(id);
        }
      });
    };

    return (
      <div className="content-view">
        <div className="playlist-list-header">
          <h3>Playlists</h3>
          <button className="xp-button primary" onClick={handleCreatePlaylist}>&#128193; New Playlist</button>
        </div>
        {playlists.length === 0 ? (
          <div className="empty-state xp-panel">
            <div className="xp-panel-body" style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>📁</div>
              <h4>No Playlists Yet</h4>
              <p style={{color: '#666', margin: '16px 0'}}>Create your first playlist to organize your music.</p>
              <button className="xp-button primary" onClick={handleCreatePlaylist}>&#128193; Create Playlist</button>
            </div>
          </div>
        ) : (
          <div className="playlist-grid">
            {playlists.map(pl => {
              const trackCount = pl.tracks.length;
              const firstTrack = trackById.get(pl.tracks[0]);
              return (
                <div 
                  key={pl.id} 
                  className={`playlist-card xp-panel ${activePlaylistId === pl.id ? 'active' : ''}`}
                  onClick={() => setActivePlaylist(pl.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="playlist-card-header">
                    <div className="playlist-cover" style={{ background: firstTrack?.coverColor || '#9e9e9e' }}>
                      {firstTrack?.coverArt ? (
                        <img src={firstTrack.coverArt} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <span>&#128193;</span>
                      )}
                    </div>
                    <div className="playlist-card-info">
                      <h4>{pl.name}</h4>
                      <p>{trackCount} track{trackCount !== 1 ? 's' : ''}</p>
                      <p className="playlist-date">Created {new Date(pl.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="playlist-card-actions">
                    <button className="xp-button small" onClick={(e) => { e.stopPropagation(); showPrompt("Rename Playlist", "Enter new name:", pl.name, (name) => { if (name && name.trim()) renamePlaylist(pl.id, name.trim()); }); }}>Rename</button>
                    <button className="xp-button small" onClick={(e) => { e.stopPropagation(); useStore.getState().showConfirm("Delete Playlist", `Delete "${pl.name}"?`, () => { useStore.getState().deletePlaylist(pl.id); }); }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Playlist detail view
  const tracks = playlist.tracks.map(id => trackById.get(id)).filter(Boolean);

  const handlePlayAll = () => {
    if (tracks.length > 0) { setCurrentSong(tracks[0]); setIsPlaying(true); }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      toggleShuffle();
      // The toggleShuffle will re-shuffle the queue. Let's manually set a shuffled queue for this playlist.
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      useStore.setState({ playQueue: shuffled.map(t => t.id), queueHistory: [] });
      setCurrentSong(shuffled[0]);
      setIsPlaying(true);
    }
  };

  const handleRename = () => {
    showPrompt("Rename Playlist", "Enter new name:", playlist.name, (name) => {
      if (name && name.trim()) renamePlaylist(playlist.id, name.trim());
    });
  };

  const handleDelete = () => {
    showConfirm("Delete Playlist", `Delete "${playlist.name}"?`, () => {
      deletePlaylist(playlist.id);
      navigateTo('home');
    });
  };

  return (
    <div className="content-view">
      <div className="playlist-header">
        <button className="xp-button" onClick={() => setActivePlaylist(null)} style={{marginRight: '12px'}}>&#8592; Back</button>
        <h3>{playlist.name}</h3>
        <div className="playlist-meta-actions">
          <button className="xp-button" onClick={handlePlayAll}>&#9658; Play All</button>
          <button className="xp-button" onClick={handleShufflePlay}>🔀 Shuffle Play</button>
          <button className="xp-button" onClick={handleRename}>Rename</button>
          <button className="xp-button" onClick={handleDelete}>Delete</button>
          <button className="xp-button" onClick={() => openModal('cdBurner')}>&#128191; Burn to CD</button>
        </div>
      </div>
      <div className="playlist-songs table-container">
        <table className="xp-table">
          <thead><tr><th style={{width:40}}>#</th><th>Song</th><th>Artist</th><th>Album</th><th>Length</th><th>Actions</th></tr></thead>
          <tbody>
            {tracks.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign:'center', padding: '20px'}}>No tracks in this playlist. Add tracks from the Library.</td></tr>
            ) : tracks.map((track, idx) => (
              <tr key={track.id} onDoubleClick={() => { setCurrentSong(track); setIsPlaying(true); }}>
                <td>{idx + 1}</td>
                <td><strong>{track.title}</strong></td>
                <td>{track.artist}</td>
                <td>{track.album}</td>
                <td>{track.duration}</td>
                <td>
                  <button className="xp-button small" onClick={(e) => { e.stopPropagation(); removeFromPlaylist(playlist.id, track.id); }}>&times; Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}