const StatCard = ({ label, value, hint, color = 'var(--accent)' }) => (
  <div className="card">
    <div className="muted" style={{ marginBottom: 4 }}>
      {label}
    </div>
    <div className="stat-value" style={{ color }}>{value}</div>
    {hint ? (
      <div className="muted" style={{ marginTop: 6 }}>
        {hint}
      </div>
    ) : null}
  </div>
);

export default StatCard;
