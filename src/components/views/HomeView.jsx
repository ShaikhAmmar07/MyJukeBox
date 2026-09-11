<<<<<<< HEAD
import useStore, { SPEED_PROFILES } from '../../store/useStore';
import { featuredAlbum } from '../../data/songs';

export default function HomeView() {
  const { library, allSongs, userName, connectionSpeed, navigateTo, openModal } = useStore();

  const recentTracks = library.slice(0, 3);
  const topDownloads = allSongs.slice(0, 5);
  const newReleases = allSongs.slice(3, 7);

  const handlePlayTrack = (track) => {
    useStore.getState().setCurrentSong(track);
    useStore.getState().setIsPlaying(true);
=======
import { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { getRecentlyPlayed } from '../../utils/audioStorage';

export default function HomeView() {
  const { library, userName, navigateTo, setCurrentSong, setIsPlaying, playlists } = useStore();
  const [recentTracks, setRecentTracks] = useState([]);

  useEffect(() => {
    const loadRecent = async () => {
      const recent = await getRecentlyPlayed();
      // Filter out tracks that no longer exist in library
      const trackIds = new Set([...library, ...useStore.getState().allSongs].map(t => t.id));
      const validRecent = recent.filter(t => trackIds.has(t.id));
      setRecentTracks(validRecent.slice(0, 5));
    };
    loadRecent();
  }, [library]);

  const handlePlayTrack = (track) => {
    setCurrentSong(track);
    setIsPlaying(true);
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  };

  return (
    <div className="content-view">
      <div className="welcome-banner">
        <h3>Welcome Back, {userName}!</h3>
<<<<<<< HEAD
        <p>Your local music hub is initialized. Internet connection: {SPEED_PROFILES[connectionSpeed]?.name || connectionSpeed}.</p>
      </div>
      <div className="home-grid">
        <div className="home-row">
          <div className="home-card featured-album-card xp-panel">
            <div className="xp-panel-header">Featured Album</div>
            <div className="xp-panel-body featured-album-body">
              <div className="featured-cover-container" style={{ background: featuredAlbum.coverColor }}>
                <div className="cd-vinyl"></div>
                <div className="artwork-label">RHCP</div>
              </div>
              <div className="featured-info">
                <h4>{featuredAlbum.title}</h4>
                <p>{featuredAlbum.artist}</p>
                <p>Price: <span className="price-tag">{featuredAlbum.price}</span></p>
                <p>Format: High-quality MP3 (320kbps)</p>
                <div className="featured-actions">
                  <button className="xp-button primary" onClick={() => navigateTo('store')}>Buy & Download</button>
                  <button className="xp-button" onClick={() => handlePlayTrack(allSongs.find(s => s.id === 2))}>Preview</button>
                </div>
              </div>
            </div>
          </div>
          <div className="home-card quick-actions-card xp-panel">
            <div className="xp-panel-header">Quick Utilities</div>
            <div className="xp-panel-body quick-actions-body">
              <button className="xp-button full-width" onClick={() => openModal('cdBurner')}>&#128191; Rip Audio CD...</button>
              <button className="xp-button full-width" onClick={() => openModal('deviceSync')}>&#128241; Sync MP3 Player</button>
              <button className="xp-button full-width" onClick={() => openModal('cdBurner')}>&#128191; Burn Playlist to CD</button>
              <button className="xp-button full-width" onClick={() => navigateTo('downloads')}>&#128190; View Download Queue</button>
=======
        <p>Your personal MP3 space. Upload your music to get started.</p>
      </div>
      <div className="home-grid">
        <div className="home-row">
          <div className="home-card upload-card xp-panel">
            <div className="xp-panel-header">Add Music</div>
            <div className="xp-panel-body quick-actions-body">
              <button className="xp-button full-width primary" onClick={() => navigateTo('library')}>&#128193; Upload MP3s</button>
              <button className="xp-button full-width" onClick={() => navigateTo('playlists')}>&#9834; Create Playlist</button>
              <button className="xp-button full-width" onClick={() => useStore.getState().openModal('cdBurner')}>&#128191; Burn Playlist to CD</button>
            </div>
          </div>
          <div className="home-card stats-card xp-panel">
            <div className="xp-panel-header">Library Stats</div>
            <div className="xp-panel-body quick-actions-body">
              <p>Tracks: <strong>{library.length}</strong></p>
              <p>Playlists: <strong>{playlists.length}</strong></p>
              <p>Total Time: <strong>{library.reduce((sum, t) => {
                const parts = (t.duration || '0:00').split(':');
                return sum + (parseInt(parts[0]) * 60 + parseInt(parts[1]));
              }, 0)} seconds</strong></p>
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
            </div>
          </div>
        </div>
        <div className="home-row">
<<<<<<< HEAD
          <div className="home-card recently-played-card xp-panel">
            <div className="xp-panel-header">Recently Played</div>
            <div className="xp-panel-body table-container">
              <table className="xp-table">
                <thead><tr><th>Title</th><th>Artist</th><th>Plays</th></tr></thead>
                <tbody>
                  {recentTracks.length === 0 ? (
                    <tr><td colSpan="3" style={{textAlign:'center'}}>No tracks played yet.</td></tr>
                  ) : recentTracks.map(track => (
                    <tr key={track.id} onDoubleClick={() => handlePlayTrack(track)}>
                      <td><strong>{track.title}</strong></td><td>{track.artist}</td><td>{track.playCount}</td>
=======
          <div className="home-card recently-played-card xp-panel" style={{flex: 1}}>
            <div className="xp-panel-header">Recently Played</div>
            <div className="xp-panel-body table-container">
              <table className="xp-table">
                <thead><tr><th>Title</th><th>Artist</th><th>Last Played</th></tr></thead>
                <tbody>
                  {recentTracks.length === 0 ? (
                    <tr><td colSpan="3" style={{textAlign:'center', padding: '20px'}}>No tracks played yet. Upload some music!</td></tr>
                  ) : recentTracks.map(track => (
                    <tr key={track.id} onDoubleClick={() => handlePlayTrack(track)}>
                      <td><strong>{track.title}</strong></td>
                      <td>{track.artist}</td>
                      <td>{new Date(track.timestamp).toLocaleString()}</td>
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
<<<<<<< HEAD
          <div className="home-card top-downloads-card xp-panel">
            <div className="xp-panel-header">Top Store Downloads (This Week)</div>
            <div className="xp-panel-body">
              <ol className="xp-list">
                {topDownloads.map((track, idx) => (
                  <li key={track.id} onClick={() => { useStore.getState().setSelectedAlbum(track.album); navigateTo('albumDetails'); }}>
                    #{idx + 1} - <strong>{track.title}</strong> by {track.artist}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        <div className="home-row">
          <div className="home-card new-releases-card xp-panel" style={{flex: 1}}>
            <div className="xp-panel-header">Hot New Releases in Store</div>
            <div className="xp-panel-body releases-grid">
              {newReleases.map(track => (
                <div key={track.id} className="release-item-card" onClick={() => { useStore.getState().setSelectedAlbum(track.album); navigateTo('albumDetails'); }}>
                  <div className="release-art" style={{ backgroundColor: track.coverColor }}>CD</div>
                  <div className="release-title">{track.title}</div>
                  <div className="release-artist">{track.artist}</div>
                </div>
              ))}
            </div>
          </div>
=======
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

function handlePlayTrack(track) {
  useStore.getState().setCurrentSong(track);
  useStore.getState().setIsPlaying(true);
}
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
