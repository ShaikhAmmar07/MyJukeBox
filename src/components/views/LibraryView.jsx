<<<<<<< HEAD
import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';

export default function LibraryView() {
  const { library, currentSong, selectedLibraryTrackId, selectLibraryTrack, setCurrentSong, setIsPlaying, removeFromLibrary, openModal, setRightClickedTrack, showConfirm } = useStore();
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);

  const tracks = useMemo(() => {
    let t = [...library];
    if (filter) {
      const q = filter.toLowerCase();
=======
import { useState, useMemo, useEffect } from 'react';
import useStore from '../../store/useStore';
import UploadPanel from './UploadPanel';

export default function LibraryView() {
  const { 
    library, currentSong, selectedLibraryTrackId, selectLibraryTrack, setCurrentSong, setIsPlaying, 
    removeFromLibrary, openModal, setRightClickedTrack, showConfirm, searchQuery, setSearchQuery, 
    updateSongMetadata, fetchSongDetails, addToPlaylist, playlists
  } = useStore();
  const [sortField, setSortField] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);
  const [fetchingId, setFetchingId] = useState(null);
  const [actionMenuTrackId, setActionMenuTrackId] = useState(null);

  useEffect(() => {
    setSearchQuery(searchQuery);
  }, []);

  const tracks = useMemo(() => {
    let t = [...library];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
      t = t.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q) || s.album.toLowerCase().includes(q));
    }
    t.sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
<<<<<<< HEAD
      return sortAsc ? va - vb : vb - va;
    });
    return t;
  }, [library, filter, sortField, sortAsc]);
=======
      return sortAsc ? (va - vb) : (vb - va);
    });
    return t;
  }, [library, searchQuery, sortField, sortAsc]);
>>>>>>> 8122ee6 (Update MyJukeBox codebase)

  const handleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handlePlay = () => {
    if (selectedLibraryTrackId) {
      const track = library.find(t => t.id === selectedLibraryTrackId);
      if (track) { setCurrentSong(track); setIsPlaying(true); }
    }
  };

  const handleDelete = () => {
    if (selectedLibraryTrackId) {
      const track = library.find(t => t.id === selectedLibraryTrackId);
      if (track) showConfirm("Delete Track", `Delete "${track.title}"?`, () => removeFromLibrary(track.id));
    }
  };

  const handleProperties = () => {
    if (selectedLibraryTrackId) {
      const track = library.find(t => t.id === selectedLibraryTrackId);
      if (track) { useStore.getState().setRightClickedTrack(track.id); openModal('properties'); }
    }
  };

<<<<<<< HEAD
=======
  const handleEditDetails = (track) => {
    openModal('editDetails');
    setRightClickedTrack(track.id);
  };

  const handleFetchDetails = (track) => {
    setFetchingId(track.id);
    fetchSongDetails(track.id).finally(() => setFetchingId(null));
  };

>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  const handleContextMenu = (e, trackId) => {
    e.preventDefault();
    setRightClickedTrack(trackId);
    const menu = document.getElementById('custom-context-menu');
    if (menu) { menu.style.left = e.clientX + 'px'; menu.style.top = e.clientY + 'px'; menu.classList.remove('hidden'); }
  };

<<<<<<< HEAD
  const sortInd = (field) => sortField === field ? (sortAsc ? ' ▲' : ' ▼') : '';

=======
  const handleActionMenu = (e, trackId) => {
    e.stopPropagation();
    setActionMenuTrackId(actionMenuTrackId === trackId ? null : trackId);
  };

  const sortInd = (field) => sortField === field ? (sortAsc ? ' ▲' : ' ▼') : '';

  const renderCover = (track) => {
    if (track.coverArt) {
      return <img className="library-cover" src={track.coverArt} alt="" style={{width: 40, height: 40, objectFit: 'cover', borderRadius: 3}} />;
    }
    return <div className="library-cover" style={{width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: track.coverColor || '#9e9e9e', borderRadius: 3, color: 'white', fontWeight: 'bold'}}>{(track.title || '♪')[0]}</div>;
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActionMenuTrackId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

>>>>>>> 8122ee6 (Update MyJukeBox codebase)
  return (
    <div className="content-view">
      <div className="library-toolbar">
        <button className="xp-button" onClick={handlePlay}>&#9658; Play</button>
<<<<<<< HEAD
        <button className="xp-button" onClick={() => { if (selectedLibraryTrackId) { const t = library.find(x => x.id === selectedLibraryTrackId); if (t) showConfirm("Queue", `"${t.title}" added to queue.`, null); } }}>+ Add to Queue</button>
        <button className="xp-button" onClick={handleDelete}>&times; Delete</button>
        <button className="xp-button" onClick={handleProperties}>Properties</button>
        <div className="lib-search-box">
          <input type="text" placeholder="Filter library..." value={filter} onChange={e => setFilter(e.target.value)} />
=======
        <button className="xp-button" onClick={handleDelete}>&times; Delete</button>
        <button className="xp-button" onClick={handleProperties}>Properties</button>
        <UploadPanel />
        <div className="lib-search-box">
          <input type="text" placeholder="Filter library..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
        </div>
      </div>
      <div className="library-container table-container">
        <table className="xp-table">
          <thead>
            <tr>
<<<<<<< HEAD
=======
              <th style={{width: 50}}>Cover</th>
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
              <th className="sortable" onClick={() => handleSort('title')}>Song{sortInd('title')}</th>
              <th className="sortable" onClick={() => handleSort('artist')}>Artist{sortInd('artist')}</th>
              <th className="sortable" onClick={() => handleSort('album')}>Album{sortInd('album')}</th>
              <th className="sortable" onClick={() => handleSort('duration')}>Length{sortInd('duration')}</th>
              <th className="sortable" onClick={() => handleSort('size')}>Size{sortInd('size')}</th>
              <th className="sortable" onClick={() => handleSort('bitrate')}>Bitrate{sortInd('bitrate')}</th>
              <th>Rating</th>
              <th className="sortable" onClick={() => handleSort('playCount')}>Plays{sortInd('playCount')}</th>
<<<<<<< HEAD
=======
              <th style={{width: 120}}>Actions</th>
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
            </tr>
          </thead>
          <tbody>
            {tracks.length === 0 ? (
<<<<<<< HEAD
              <tr><td colSpan="8" style={{textAlign:'center', padding: '20px'}}>Library empty. Purchase songs in the Store.</td></tr>
=======
              <tr><td colSpan="10" style={{textAlign:'center', padding: '20px'}}>Library empty. Upload MP3s to build your collection.</td></tr>
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
            ) : tracks.map(track => (
              <tr key={track.id}
                className={`${currentSong?.id === track.id ? 'active-track' : ''} ${selectedLibraryTrackId === track.id ? 'selected' : ''}`}
                onClick={() => selectLibraryTrack(track.id)}
                onDoubleClick={() => { setCurrentSong(track); setIsPlaying(true); }}
                onContextMenu={e => handleContextMenu(e, track.id)}
              >
<<<<<<< HEAD
=======
                <td>{renderCover(track)}</td>
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
                <td><strong>{track.title}</strong></td>
                <td>{track.artist}</td>
                <td>{track.album}</td>
                <td>{track.duration}</td>
                <td>{track.size}</td>
                <td>{track.bitrate}</td>
<<<<<<< HEAD
                <td style={{color:'#ffb300'}}>{'★'.repeat(track.rating)}{'☆'.repeat(5 - track.rating)}</td>
                <td>{track.playCount}</td>
=======
                <td style={{color:'#ffb300'}}>{'★'.repeat(track.rating || 0)}{'☆'.repeat(5 - (track.rating || 0))}</td>
                <td>{track.playCount || 0}</td>
                <td>
                  <div className="track-actions">
                    <button className="xp-button small" onClick={(e) => { e.stopPropagation(); handleFetchDetails(track); }} disabled={fetchingId === track.id}>
                      {fetchingId === track.id ? '...' : 'Fetch'}
                    </button>
                    <button className="xp-button small action-menu-btn" onClick={(e) => handleActionMenu(e, track.id)} title="More actions">&#8942;</button>
                    {actionMenuTrackId === track.id && (
                      <div className="action-menu">
                        <div className="action-menu-item" onClick={(e) => { e.stopPropagation(); setCurrentSong(track); setIsPlaying(true); setActionMenuTrackId(null); }}>&#9658; Play</div>
                        <div className="action-menu-item" onClick={(e) => { e.stopPropagation(); setActionMenuTrackId(null); openModal('addToPlaylist'); setRightClickedTrack(track.id); }}>&#128193; Add to Playlist</div>
                        <div className="action-menu-item" onClick={(e) => { e.stopPropagation(); setActionMenuTrackId(null); handleEditDetails(track); }}>&#9998; Edit Details</div>
                        <div className="action-menu-item danger" onClick={(e) => { e.stopPropagation(); setActionMenuTrackId(null); showConfirm("Delete Track", `Delete "${track.title}"?`, () => removeFromLibrary(track.id)); }}>&times; Delete from Library</div>
                      </div>
                    )}
                  </div>
                </td>
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 8122ee6 (Update MyJukeBox codebase)
