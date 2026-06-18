import { useState, useEffect } from 'react';
import { getMediaFiles } from './mediaService';
import './ImagePicker.css';

export default function ImagePicker({ value, onChange, label = 'Imagen' }) {
  const [mode, setMode] = useState('url');
  const [showLibrary, setShowLibrary] = useState(false);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  async function openLibrary() {
    setShowLibrary(true);
    if (files.length === 0) {
      setLoadingFiles(true);
      try {
        const data = await getMediaFiles();
        setFiles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFiles(false);
      }
    }
  }

  function selectFile(file) {
    onChange(file.url);
    setShowLibrary(false);
  }

  return (
    <div className="image-picker">
      <label className="image-picker__label">{label}</label>

      <div className="image-picker__modes">
        <button
          type="button"
          className={`image-picker__mode-btn ${mode === 'url' ? 'image-picker__mode-btn--active' : ''}`}
          onClick={() => setMode('url')}
        >
          Pegar URL
        </button>
        <button
          type="button"
          className={`image-picker__mode-btn ${mode === 'library' ? 'image-picker__mode-btn--active' : ''}`}
          onClick={() => { setMode('library'); openLibrary(); }}
        >
          Media Library
        </button>
      </div>

      {mode === 'url' && (
        <input
          type="text"
          className="image-picker__input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      )}

      {mode === 'library' && showLibrary && (
        <div className="image-picker__library">
          {loadingFiles ? (
            <p className="image-picker__loading">Cargando...</p>
          ) : files.length === 0 ? (
            <p className="image-picker__empty">No hay imágenes. Sube desde /admin/media.</p>
          ) : (
            <div className="image-picker__grid">
              {files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className={`image-picker__thumb ${file.url === value ? 'image-picker__thumb--selected' : ''}`}
                  onClick={() => selectFile(file)}
                >
                  <img src={file.thumbnailUrl || file.url} alt={file.name} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {value && (
        <div className="image-picker__preview">
          <img src={value} alt="Preview" loading="lazy" />
          <button type="button" className="image-picker__clear" onClick={() => onChange('')}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
