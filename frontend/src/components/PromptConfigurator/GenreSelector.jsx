import { FiChevronDown } from 'react-icons/fi'
import { GENRES } from '../../utils/promptBuilder'

export function GenreSelector({ value, onChange }) {
  return (
    <div className="genre-selector">
      <label className="genre-label">GENRE</label>
      <div className="genre-select-wrapper">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="genre-select"
        >
          <option value="">Select genre...</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre.toUpperCase()}
            </option>
          ))}
        </select>
        <FiChevronDown className="genre-select-icon" size={16} />
      </div>
    </div>
  )
}
