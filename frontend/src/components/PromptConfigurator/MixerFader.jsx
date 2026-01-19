export function MixerFader({ label, value, onChange, minLabel, maxLabel }) {
  return (
    <div className="mixer-fader">
      <div className="fader-label">{label}</div>
      <div className="fader-container">
        <span className="fader-range-label max">{maxLabel}</span>
        <div className="fader-track">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="fader-input"
            orient="vertical"
          />
          <div
            className="fader-fill"
            style={{ height: `${value}%` }}
          />
        </div>
        <span className="fader-range-label min">{minLabel}</span>
      </div>
      <div className="fader-value">{value}</div>
    </div>
  )
}
