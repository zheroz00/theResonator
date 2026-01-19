import { useState } from 'react'
import { FiZap, FiSliders, FiEdit3, FiShuffle } from 'react-icons/fi'
import { PromptConfigurator } from './PromptConfigurator'
import { generateRandomPrompt } from '../api/openrouter'

export function PromptInput({ onGenerate, isGenerating }) {
  const [mode, setMode] = useState('mixer') // 'mixer' or 'manual'
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(15)
  const [isRandomizing, setIsRandomizing] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim(), duration)
    }
  }

  const handleRandomize = async () => {
    if (isRandomizing || isGenerating) return
    setIsRandomizing(true)
    try {
      const randomPrompt = await generateRandomPrompt()
      setPrompt(randomPrompt)
    } catch (error) {
      console.error('Failed to generate random prompt:', error)
    } finally {
      setIsRandomizing(false)
    }
  }

  return (
    <div className="prompt-input-container">
      <div className="mode-toggle">
        <button
          type="button"
          className={`mode-btn ${mode === 'mixer' ? 'active' : ''}`}
          onClick={() => setMode('mixer')}
        >
          <FiSliders size={16} />
          MIXER
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => setMode('manual')}
        >
          <FiEdit3 size={16} />
          MANUAL
        </button>
        <div className="duration-wrapper">
          <label className="duration-label">DURATION</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={isGenerating}
            className="duration-select"
          >
            <option value={10}>10s</option>
            <option value={15}>15s</option>
            <option value={20}>20s</option>
            <option value={30}>30s</option>
          </select>
        </div>
      </div>

      {mode === 'mixer' ? (
        <PromptConfigurator
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          duration={duration}
        />
      ) : (
        <form onSubmit={handleSubmit} className="prompt-input">
          <div className="input-row">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="neurofunk bass drop with reese growl..."
              disabled={isGenerating || isRandomizing}
              className="prompt-field"
            />
            <button
              type="button"
              onClick={handleRandomize}
              disabled={isGenerating || isRandomizing}
              className="randomize-btn"
              title="Generate random prompt (AI-powered)"
            >
              <FiShuffle className={isRandomizing ? 'spinning' : ''} />
            </button>
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="generate-btn"
            >
              <FiZap />
              {isGenerating ? 'GENERATING...' : 'GENERATE'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
