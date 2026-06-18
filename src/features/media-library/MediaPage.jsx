import { useState, useEffect, useRef, useMemo } from 'react';
import {
  getMediaFiles,
  uploadMediaFile,
  deleteMediaFile,
  validateFile,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
} from './mediaService';
import './MediaPage.css';

const ITEMS_PER_PAGE = 24;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MediaPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMediaFiles();
      setFiles(data);
    } catch (err) {
      setError('Error al cargar las imágenes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    setError(null);
    setSuccess(null);

    for (const file of selectedFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        return;
      }
    }

    try {
      setUploading(true);
      for (const file of selectedFiles) {
        const result = await uploadMediaFile(file);
        setFiles((prev) => [{ ...result, createdAt: new Date() }, ...prev]);
      }
      setSuccess(`${selectedFiles.length} imagen(es) subida(s) correctamente.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al subir. Intenta de nuevo.');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(item) {
    try {
      setError(null);
      await deleteMediaFile(item);
      setFiles((prev) => prev.filter((f) => f.id !== item.id));
      setSelected(null);
      setConfirmDelete(null);
      setSuccess('Imagen eliminada.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al eliminar la imagen.');
      console.error(err);
    }
  }

  function handleCopyUrl(url) {
    navigator.clipboard.writeText(url);
    setSuccess('URL copiada al portapapeles.');
    setTimeout(() => setSuccess(null), 2000);
  }

  return (
    <div className="admin-page media-page">
      <div className="admin-page__header">
        <h1>Media Library</h1>
        <label className={`media-page__upload-btn ${uploading ? 'media-page__upload-btn--disabled' : ''}`}>
          {uploading ? 'Subiendo...' : 'Subir imágenes'}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="visually-hidden"
          />
        </label>
      </div>

      <p className="media-page__hint">
        Formatos: JPG, PNG, WebP. Máximo {MAX_FILE_SIZE / 1024 / 1024}MB por archivo.
      </p>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      {loading ? (
        <p className="admin-loading">Cargando imágenes...</p>
      ) : files.length === 0 ? (
        <div className="media-page__empty">
          <p>No hay imágenes aún. Sube tu primera imagen.</p>
        </div>
      ) : (
        <>
          <div className="media-page__grid">
            {files.slice(0, visibleCount).map((file) => (
              <button
                key={file.id}
                className={`media-page__item ${selected?.id === file.id ? 'media-page__item--selected' : ''}`}
                onClick={() => setSelected(file)}
                type="button"
              >
                <img
                  src={file.thumbnailUrl || file.url}
                  alt={file.name}
                  loading="lazy"
                  decoding="async"
                  className="media-page__thumb"
                />
              </button>
            ))}
          </div>
          {visibleCount < files.length && (
            <div className="media-page__load-more">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
              >
                Cargar más ({files.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="media-page__detail">
          <div className="media-page__detail-preview">
            <img src={selected.url} alt={selected.name} loading="lazy" />
          </div>
          <div className="media-page__detail-info">
            <h3>{selected.name}</h3>
            <dl className="media-page__meta">
              <dt>Tipo</dt>
              <dd>{selected.type}</dd>
              <dt>Tamaño</dt>
              <dd>{formatBytes(selected.size)}</dd>
              <dt>Fecha</dt>
              <dd>{formatDate(selected.createdAt)}</dd>
            </dl>

            <div className="media-page__detail-url">
              <input type="text" readOnly value={selected.url} />
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => handleCopyUrl(selected.url)}
              >
                Copiar URL
              </button>
            </div>

            <div className="media-page__detail-actions">
              {confirmDelete === selected.id ? (
                <div className="media-page__confirm">
                  <span>¿Eliminar esta imagen?</span>
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
                    onClick={() => handleDelete(selected)}
                  >
                    Sí, eliminar
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => setConfirmDelete(null)}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="admin-btn admin-btn--danger-outline"
                  onClick={() => setConfirmDelete(selected.id)}
                >
                  Eliminar imagen
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
