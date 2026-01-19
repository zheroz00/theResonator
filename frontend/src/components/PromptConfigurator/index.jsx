import { FiShuffle, FiZap, FiRotateCcw } from 'react-icons/fi'
import { MixerFader } from './MixerFader'
import { GenreSelector } from './GenreSelector'
import { ElementChips } from './ElementChips'
import { usePromptMixer } from '../../hooks/usePromptMixer'

const FADER_CONFIG = [
  { key: 'energy', label: 'ENERGY', min: 'AMBIENT', max: 'INTENSE' },
  { key: 'mood', label: 'MOOD', min: 'DARK', max: 'BRIGHT' },
  { key: 'texture', label: 'TEXTURE', min: 'SMOOTH', max: 'GRITTY' },
  { key: 'complexity', label: 'LAYERS', min: 'MINIMAL', max: 'DENSE' },
  { key: 'bass', label: 'BASS', min: 'SUB', max: 'MID' },
]

export function PromptConfigurator({ onGenerate, isGenerating, duration }) {
  const {
    mixerState,
    setFaderValue,
    setGenre,
    toggleElement,
    randomize,
    reset,
    generatedPrompt,
  } = usePromptMixer()

  const handleGenerate = () => {
    if (generatedPrompt.trim()) {
      onGenerate(generatedPrompt, duration)
    }
  }

  return (
    <div className="prompt-configurator">
      <div className="mixer-section">
        <div className="mixer-faders">
          {FADER_CONFIG.map((fader) => (
            <MixerFader
              key={fader.key}
              label={fader.label}
              value={mixerState[fader.key]}
              onChange={(value) => setFaderValue(fader.key, value)}
              minLabel={fader.min}
              maxLabel={fader.max}
            />
          ))}
        </div>

        <div className="mixer-controls">
          <GenreSelector value={mixerState.genre} onChange={setGenre} />
          <ElementChips
            selected={mixerState.elements}
            onToggle={toggleElement}
          />
        </div>
      </div>

      <div className="prompt-preview">
        <label className="preview-label">GENERATED PROMPT</label>
        <div className="preview-text">
          {generatedPrompt || 'Adjust faders to build your prompt...'}
        </div>
      </div>

      <div className="mixer-actions">
        <button
          type="button"
          className="btn-randomize"
          onClick={randomize}
          title="Randomize all settings"
        >
          <FiShuffle size={18} />
          RANDOMIZE
        </button>
        <button
          type="button"
          className="btn-reset"
          onClick={reset}
          title="Reset to defaults"
        >
          <FiRotateCcw size={18} />
          RESET
        </button>
        <button
          type="button"
          className="btn-generate-mixer"
          onClick={handleGenerate}
          disabled={isGenerating || !generatedPrompt.trim()}
        >
          <FiZap size={18} />
          {isGenerating ? 'GENERATING...' : 'GENERATE'}
        </button>
      </div>
    </div>
  )
}
