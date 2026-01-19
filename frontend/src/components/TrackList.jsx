import { useState } from 'react'
import { FiMusic, FiCheck, FiStar, FiTrash2, FiEdit2, FiDownload } from 'react-icons/fi'
import { ConfirmDialog } from './ConfirmDialog'

export function TrackList({
  tracks,
  currentTrack,
  showFavoritesOnly,
  totalFavoriteCount,
  onToggleFavoritesFilter,
  onSelectTrack,
  onToggleFavorite,
  onRename,
  onDelete,
}) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const handleStartRename = (e, track) => {
    e.stopPropagation()
    setEditingId(track.id)
    setEditName(track.customName || '')
  }

  const handleSaveRename = (track) => {
    if (editName.trim()) {
      onRename(track, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  const handleKeyDown = (e, track) => {
    if (e.key === 'Enter') {
      handleSaveRename(track)
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditName('')
    }
  }

  const handleDownload = (e, track) => {
    e.stopPropagation()
    const url = track.processedUrl || track.url
    const filename = track.processedFilename || track.filename
    const link = document.createElement('a')
    link.href = url
    link.download = track.customName
      ? `${track.customName}.wav`
      : filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (tracks.length === 0) {
    return (
      <div className="track-list empty">
        <div className="track-list-header">
          <span>SONG LIBRARY</span>
          {totalFavoriteCount > 0 && (
            <button
              className={`filter-btn ${showFavoritesOnly ? 'active' : ''}`}
              onClick={onToggleFavoritesFilter}
              title={showFavoritesOnly ? 'Show all tracks' : 'Show favorites only'}
            >
              <FiStar size={12} />
              <span>{totalFavoriteCount}</span>
            </button>
          )}
        </div>
        <div className="empty-state">
          <FiMusic size={24} />
          <span>{showFavoritesOnly ? 'No favorites yet' : 'No tracks yet'}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="track-list">
        <div className="track-list-header">
          <span>SONG LIBRARY</span>
          <button
            className={`filter-btn ${showFavoritesOnly ? 'active' : ''}`}
            onClick={onToggleFavoritesFilter}
            title={showFavoritesOnly ? 'Show all tracks' : 'Show favorites only'}
          >
            <FiStar size={12} />
            <span>{totalFavoriteCount}</span>
          </button>
        </div>
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`track-item ${currentTrack?.id === track.id ? 'active' : ''} ${track.isFavorite ? 'favorite' : ''}`}
            onClick={() => onSelectTrack(track)}
          >
            {track.isFavorite && (
              <div className="favorite-indicator">
                <FiStar size={12} />
              </div>
            )}
            <div className="track-info">
              {editingId === track.id ? (
                <input
                  type="text"
                  className="track-rename-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, track)}
                  onBlur={() => handleSaveRename(track)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  placeholder="Enter name..."
                />
              ) : (
                <div className="track-prompt">
                  {track.customName || track.prompt}
                </div>
              )}
              <div className="track-meta">
                {new Date(track.createdAt).toLocaleDateString()}
                {' '}
                {new Date(track.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {track.processed && (
                  <span className="processed-badge">
                    <FiCheck size={12} /> TICKLED
                  </span>
                )}
              </div>
            </div>
            <div className="track-actions">
              <button
                className={`action-btn ${track.isFavorite ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(track)
                }}
                title={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FiStar size={14} />
              </button>
              <button
                className="action-btn"
                onClick={(e) => handleStartRename(e, track)}
                title="Rename"
              >
                <FiEdit2 size={14} />
              </button>
              <button
                className="action-btn"
                onClick={(e) => handleDownload(e, track)}
                title="Download"
              >
                <FiDownload size={14} />
              </button>
              <button
                className="action-btn delete"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget(track)
                }}
                title="Delete"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Track"
        message={`Are you sure you want to delete "${deleteTarget?.customName || deleteTarget?.prompt}"? This will permanently remove the audio files.`}
        onConfirm={() => {
          onDelete(deleteTarget)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
