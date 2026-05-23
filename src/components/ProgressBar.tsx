interface Props {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: Props) {
  const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress-wrap" aria-label={label}>
      <div className="progress-meta">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
