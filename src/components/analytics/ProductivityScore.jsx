import React from 'react';

const SIZE = 120;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function ScoreRing({ value, color, label }) {
  const pct = Math.min(Math.max(value, 0), 100) / 100;
  const offset = CIRC * (1 - pct);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={STROKE} />
          <circle
            cx={SIZE/2} cy={SIZE/2} r={R} fill="none"
            stroke={color} strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <span style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: 22, fontWeight: 800, color: '#1e1b4b',
        }}>
          {Math.round(value)}
        </span>
      </div>
      <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

export default function ProductivityScore({ score }) {
  if (!score) {
    return (
      <div className="chart-card" style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ color: '#9ca3af', fontSize: 13 }}>Collecting data… 🐱</p>
      </div>
    );
  }

  const getRating = (s) => {
    if (s >= 70) return { label: 'High 🚀', color: '#34d399' };
    if (s >= 40) return { label: 'Medium ⚡', color: '#fbbf24' };
    return { label: 'Low 😴', color: '#f87171' };
  };
  const rating = getRating(score.total);

  return (
    <div className="chart-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 className="chart-title" style={{ marginBottom: 0 }}>📊 Productivity Score</h3>
        <span style={{
          background: rating.color, color: '#fff', padding: '2px 10px',
          borderRadius: 20, fontSize: 11, fontWeight: 700,
        }}>
          {rating.label}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 10 }}>
        <ScoreRing value={score.total} color={rating.color} label="Overall" />
        <ScoreRing value={score.pomodoroScore} color="#f472b6" label="Pomodoro" />
        <ScoreRing value={score.taskScore} color="#60a5fa" label="Tasks" />
        <ScoreRing value={score.screenScore} color="#a78bfa" label="Balance" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
        <div className="stat-chip">
          <span>🍅 Sessions</span>
          <strong>{score.sessionCount}</strong>
        </div>
        <div className="stat-chip">
          <span>🖥 Screen</span>
          <strong>{Math.round(score.screenMins)} min</strong>
        </div>
      </div>
    </div>
  );
}
