import { useState, useRef, useEffect } from 'react'
import { FiActivity, FiCpu, FiChevronDown, FiMusic, FiVolume2 } from 'react-icons/fi'

export function Controls({
  onApplyEffects,
  onSeparateStems,
  onDenoise,
  isProcessing,
  isAIProcessing,
  canProcess,
  hasTrack,
}) {
  const [showAIMenu, setShowAIMenu] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAIMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStemSeparation = () => {
    setShowAIMenu(false)
    onSeparateStems?.()
  }

  const handleDenoise = () => {
    setShowAIMenu(false)
    onDenoise?.()
  }

  return (
    <div className="controls">
      <button
        onClick={onApplyEffects}
        disabled={isProcessing || isAIProcessing || !canProcess}
        className="tickle-btn"
      >
        <FiActivity className="icon" />
        {isProcessing ? 'PROCESSING...' : 'APPLY BRAIN TICKLES'}
      </button>

      <div className="ai-process-container" ref={menuRef}>
        <button
          onClick={() => setShowAIMenu(!showAIMenu)}
          disabled={isProcessing || isAIProcessing || !hasTrack}
          className="ai-process-btn"
        >
          <FiCpu className="icon" />
          {isAIProcessing ? 'AI PROCESSING...' : 'AI PROCESS'}
          <FiChevronDown className={`chevron ${showAIMenu ? 'open' : ''}`} />
        </button>

        {showAIMenu && (
          <div className="ai-menu">
            <button
              className="ai-menu-item"
              onClick={handleStemSeparation}
              disabled={isAIProcessing}
            >
              <FiMusic size={14} />
              <div className="ai-menu-item-content">
                <span className="ai-menu-item-label">Separate Stems</span>
                <span className="ai-menu-item-desc">Split into vocals, drums, bass, other</span>
              </div>
            </button>
            <button
              className="ai-menu-item"
              onClick={handleDenoise}
              disabled={isAIProcessing}
            >
              <FiVolume2 size={14} />
              <div className="ai-menu-item-content">
                <span className="ai-menu-item-label">Denoise</span>
                <span className="ai-menu-item-desc">Remove noise and artifacts</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
