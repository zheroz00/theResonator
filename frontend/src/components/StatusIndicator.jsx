import { FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

export function StatusIndicator({ isGenerating, isProcessing, isAIProcessing, error }) {
  if (error) {
    return (
      <div className="status-indicator error">
        <FiAlertCircle className="icon" />
        <span>{error}</span>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="status-indicator loading">
        <FiLoader className="icon spinning" />
        <span>GENERATING BASS...</span>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="status-indicator loading">
        <FiLoader className="icon spinning" />
        <span>APPLYING BRAIN TICKLES...</span>
      </div>
    )
  }

  if (isAIProcessing) {
    return (
      <div className="status-indicator loading">
        <FiLoader className="icon spinning" />
        <span>AI PROCESSING... (this may take a while)</span>
      </div>
    )
  }

  return null
}
