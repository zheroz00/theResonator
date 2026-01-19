import { FiAlertTriangle, FiX } from 'react-icons/fi'

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <FiAlertTriangle size={20} />
          <span>{title}</span>
          <button className="dialog-close" onClick={onCancel}>
            <FiX size={18} />
          </button>
        </div>
        <div className="dialog-body">{message}</div>
        <div className="dialog-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
