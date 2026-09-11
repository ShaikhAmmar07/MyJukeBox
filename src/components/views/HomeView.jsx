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
  };

  return (
    <div className="content-view">
      <div className="welcome-banner">
        <h3>Welcome Back, {userName}!</h3>
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
            </div>
          </div>
        </div>
        <div className="home-row">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}