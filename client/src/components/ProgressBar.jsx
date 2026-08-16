export default function ProgressBar({ value = 0, height = 10, showLabel = true }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="progress" style={{ height }}>
        <div
          className="progress-bar progress-bar-brand"
          role="progressbar"
          style={{ width: `${pct}%`, backgroundColor: '#0056D2' }}
          aria-valuenow={pct}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      {showLabel && <small className="text-muted">{pct}% complete</small>}
    </div>
  );
}
