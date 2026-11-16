export default function Ring({ progress, value, label, sub }) {
  const radius = 42
  const length = 2 * Math.PI * radius
  const amount = Math.max(0, Math.min(1, progress))
  const small = String(value).length > 3
  return (
    <div className="ring" aria-live="polite">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} className="ring-track" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="ring-value-arc"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - amount)}
        />
      </svg>
      <div className="ring-center">
        <div>
          <div className="tiny">{label}</div>
          <div className={small ? 'ring-read small' : 'ring-read'}>{value}</div>
          <div className="muted tiny-sub">{sub}</div>
        </div>
      </div>
    </div>
  )
}
