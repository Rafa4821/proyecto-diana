import { useState, useEffect, useRef, useCallback } from 'react';
import { getMediaFiles, uploadMediaFile, validateFile, ALLOWED_TYPES } from './mediaService';
import './ImagePicker.css';

export default function ImagePicker({ value, onChange, label = 'Imagen' }) {
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  async function loadFiles() {
    setLoading(true);
    try {
      const data = await getMediaFiles();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setShowModal(true);
    setSearch('');
    setUploadError(null);
    loadFiles();
  }

  function closeModal() {
    setShowModal(false);
  }

  function selectFile(file) {
    onChange(file.url);
    closeModal();
  }

  const filteredFiles = search
    ? files.filter((f) => f.name?.toLowerCase().includes(search.toLowerCase()))
    : files;

  async function handleUpload(fileList) {
    const selectedFiles = Array.from(fileList);
    if (!selectedFiles.length) return;

    setUploadError(null);
    for (const file of selectedFiles) {
      const err = validateFile(file);
      if (err) {
        setUploadError(`${file.name}: ${err}`);
        return;
      }
    }

    try {
      setUploading(true);
      for (const file of selectedFiles) {
        const result = await uploadMediaFile(file);
        setFiles((prev) => [{ ...result, createdAt: new Date() }, ...prev]);
      }
    } catch (err) {
      setUploadError('Error al subir. Intenta de nuevo.');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleFileInput(e) {
    handleUpload(e.target.files);
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
    if (e.dataTransfer.files?.length) {
      handleUpload(e.dataTransfer.files);
    }
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && showModal) closeModal();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

  return (
    <div className="image-picker">
      <label className="image-picker__label">{label}</label>

      {value ? (
        <div className="image-picker__current">
          <div className="image-picker__current-img">
            <img src={value} alt="Imagen seleccionada" loading="lazy" />
          </div>
          <div className="image-picker__current-actions">
            <button type="button" className="image-picker__action-btn" onClick={openModal}>
              Cambiar imagen
            </button>
            <button type="button" className="image-picker__action-btn image-picker__action-btn--danger" onClick={() => onChange('')}>
              Quitar imagen
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="image-picker__select-btn" onClick={openModal}>
          <span className="image-picker__select-icon">+</span>
          <span className="image-picker__select-text">Seleccionar imagen</span>
          <span className="image-picker__select-hint">Desde la biblioteca de medios o sube una nueva</span>
        </button>
      )}

      {showModal && (
        <div className="image-picker__overlay" onClick={closeModal}>
          <div className="image-picker__modal" onClick={(e) => e.stopPropagation()}>
            <div className="image-picker__modal-header">
              <h2>Biblioteca de medios</h2>
              <button type="button" className="image-picker__modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="image-picker__modal-toolbar">
              <input
                type="text"
                className="image-picker__modal-search"
                placeholder="Buscar imagen por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <label className={`image-picker__upload-btn ${uploading ? 'image-picker__upload-btn--disabled' : ''}`}>
                {uploading ? 'Subiendo...' : 'Subir imagen'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_TYPES.join(',')}
                  multiple
                  onChange={handleFileInput}
                  disabled={uploading}
                  className="visually-hidden"
                />
              </label>
            </div>

            {uploadError && (
              <div className="image-picker__modal-error">{uploadError}</div>
            )}

            <div
              ref={dropRef}
              className={`image-picker__modal-body ${dragging ? 'image-picker__modal-body--dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {dragging && (
                <div className="image-picker__drop-overlay">
                  <p>Suelta las imágenes aquí</p>
                </div>
              )}

              {loading ? (
                <div className="image-picker__modal-loading">
                  <p>Cargando biblioteca...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="image-picker__modal-empty">
                  {files.length === 0 ? (
                    <>
                      <span className="image-picker__modal-empty-icon">+</span>
                      <p>No hay imágenes en la biblioteca.</p>
                      <p>Arrastra imágenes aquí o usa el botón "Subir imagen".</p>
                    </>
                  ) : (
                    <p>No se encontraron imágenes con "{search}"</p>
                  )}
                </div>
              ) : (
                <div className="image-picker__modal-grid">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      className={`image-picker__modal-item ${file.url === value ? 'image-picker__modal-item--selected' : ''}`}
                      onClick={() => selectFile(file)}
                      title={file.name}
                    >
                      <img src={file.thumbnailUrl || file.url} alt={file.name} loading="lazy" />
                      {file.url === value && (
                        <span className="image-picker__modal-check">✓</span>
                      )}
                      <span className="image-picker__modal-item-name">{file.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="image-picker__modal-footer">
              <span className="image-picker__modal-count">{filteredFiles.length} imagen(es)</span>
              <button type="button" className="admin-btn admin-btn--secondary" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
