import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(timestamp) {
  if (!timestamp) return '--';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getTypeLabel(type) {
  if (!type) return '--';
  const map = { 'image/jpeg': 'JPG', 'image/png': 'PNG', 'image/webp': 'WebP' };
  return map[type] || type;
}

export default function MediaPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

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
      setError('Error al cargar las imagenes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
    const types = {};
    files.forEach((f) => {
      const label = getTypeLabel(f.type);
      types[label] = (types[label] || 0) + 1;
    });
    return { total: files.length, totalSize, types };
  }, [files]);

  const filtered = useMemo(() => {
    return files.filter((f) => {
      if (filterType !== 'all' && f.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(f.name || '').toLowerCase().includes(q) && !(f.filename || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [files, filterType, search]);

  async function processUpload(fileList) {
    const selectedFiles = Array.from(fileList);
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
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress(`Subiendo ${i + 1} de ${selectedFiles.length}...`);
        const result = await uploadMediaFile(selectedFiles[i]);
        setFiles((prev) => [{ ...result, createdAt: new Date() }, ...prev]);
      }
      setSuccess(`${selectedFiles.length} imagen(es) subida(s) correctamente.`);
      setUploadProgress('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al subir. Intenta de nuevo.');
      setUploadProgress('');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleUpload(e) {
    processUpload(e.target.files);
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUpload(e.dataTransfer.files);
    }
  }, []);

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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeDetail() {
    setSelected(null);
    setConfirmDelete(null);
    setCopied(false);
  }

  return (
    <div className="admin-page media-page">
      {/* Header */}
      <div className="media-page__header">
        <div>
          <h1>Biblioteca de medios</h1>
          <p className="media-page__subtitle">
            {stats.total} archivo(s) · {formatBytes(stats.totalSize)} en total
          </p>
        </div>
        <label className={`media-page__upload-btn ${uploading ? 'media-page__upload-btn--disabled' : ''}`}>
          {uploading ? uploadProgress || 'Subiendo...' : 'Subir imagenes'}
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

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      {/* Drop zone / empty */}
      {!loading && files.length === 0 && (
        <div
          ref={dropRef}
          className={`media-page__dropzone ${dragging ? 'media-page__dropzone--active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="media-page__dropzone-icon">+</div>
          <p><strong>Arrastra imagenes aqui</strong></p>
          <p>o haz clic en "Subir imagenes" para seleccionar archivos</p>
          <span className="media-page__dropzone-hint">JPG, PNG, WebP · Max {MAX_FILE_SIZE / 1024 / 1024}MB</span>
        </div>
      )}

      {loading ? (
        <p className="admin-loading">Cargando imagenes...</p>
      ) : files.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="media-page__toolbar">
            <div className="media-page__filters">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'image/jpeg', label: 'JPG' },
                { value: 'image/png', label: 'PNG' },
                { value: 'image/webp', label: 'WebP' },
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`media-page__filter-btn ${filterType === f.value ? 'media-page__filter-btn--active' : ''}`}
                  onClick={() => setFilterType(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="media-page__search"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Drop overlay for existing files */}
          <div
            className={`media-page__grid-wrapper ${dragging ? 'media-page__grid-wrapper--dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {dragging && (
              <div className="media-page__drop-overlay">
                <span>Suelta para subir</span>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="media-page__no-results">
                <p>No se encontraron archivos</p>
                {(search || filterType !== 'all') && (
                  <button type="button" className="admin-btn admin-btn--secondary" onClick={() => { setSearch(''); setFilterType('all'); }}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="media-page__grid">
                {filtered.slice(0, visibleCount).map((file) => (
                  <button
                    key={file.id}
                    className={`media-page__item ${selected?.id === file.id ? 'media-page__item--selected' : ''}`}
                    onClick={() => { setSelected(file); setConfirmDelete(null); setCopied(false); }}
                    type="button"
                  >
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.name}
                      loading="lazy"
                      decoding="async"
                      className="media-page__thumb"
                    />
                    <div className="media-page__item-overlay">
                      <span className="media-page__item-name">{file.name}</span>
                      <span className="media-page__item-size">{formatBytes(file.size)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {visibleCount < filtered.length && (
            <div className="media-page__load-more">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
              >
                Cargar mas ({filtered.length - visibleCount} restantes)
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="media-page__detail-backdrop" onClick={closeDetail}>
          <div className="media-page__detail" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="media-page__detail-close" onClick={closeDetail}>×</button>

            <div className="media-page__detail-preview">
              <img src={selected.url} alt={selected.name} loading="lazy" />
            </div>

            <div className="media-page__detail-info">
              <h3>{selected.name}</h3>

              <div className="media-page__meta-grid">
                <div className="media-page__meta-item">
                  <span className="media-page__meta-label">Formato</span>
                  <span className="media-page__meta-value">{getTypeLabel(selected.type)}</span>
                </div>
                <div className="media-page__meta-item">
                  <span className="media-page__meta-label">Peso</span>
                  <span className="media-page__meta-value">{formatBytes(selected.size)}</span>
                </div>
                <div className="media-page__meta-item">
                  <span className="media-page__meta-label">Subido</span>
                  <span className="media-page__meta-value">{formatDate(selected.createdAt)}</span>
                </div>
              </div>

              <div className="media-page__detail-url">
                <label className="media-page__url-label">URL del archivo</label>
                <div className="media-page__url-row">
                  <input type="text" readOnly value={selected.url} />
                  <button
                    type="button"
                    className={`admin-btn ${copied ? 'admin-btn--success' : 'admin-btn--secondary'}`}
                    onClick={() => handleCopyUrl(selected.url)}
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="media-page__detail-actions">
                {confirmDelete === selected.id ? (
                  <div className="media-page__confirm">
                    <span>Eliminar esta imagen?</span>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger"
                      onClick={() => handleDelete(selected)}
                    >
                      Si, eliminar
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
        </div>
      )}
    </div>
  );
}
