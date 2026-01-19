import { ELEMENTS } from '../../utils/promptBuilder'

export function ElementChips({ selected, onToggle }) {
  return (
    <div className="element-chips">
      <label className="chips-label">ELEMENTS</label>
      <div className="chips-container">
        {ELEMENTS.map((element) => (
          <button
            key={element}
            type="button"
            className={`chip ${selected.includes(element) ? 'active' : ''}`}
            onClick={() => onToggle(element)}
          >
            {element}
          </button>
        ))}
      </div>
    </div>
  )
}
