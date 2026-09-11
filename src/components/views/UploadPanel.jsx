import { useState } from 'react';
import useStore from '../../store/useStore';

export default function UploadPanel() {
  const uploadFiles = useStore(s => s.uploadFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useState(null);

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3,audio/mpeg';
    input.multiple = true;
    input.style.display = 'none';
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      setIsUploading(true);
      setMessage(`Processing ${files.length} file(s)...`);
      try {
        const uploaded = await uploadFiles(files);
        setMessage(`Successfully added ${uploaded.length} track(s) to library!`);
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('Upload failed: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  return (
    <div className="upload-panel" style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <button className="xp-button primary" onClick={handleClick} disabled={isUploading}>
        {isUploading ? 'Uploading...' : '&#128193; Upload MP3s'}
      </button>
      {message && <span style={{fontSize: 11, color: '#006600'}}>{message}</span>}
    </div>
  );
}