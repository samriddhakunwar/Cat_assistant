import React from 'react';
import { useWaterTracker } from '../../hooks/useWaterTracker';

const GLASS_SVG = (filled) => (
  <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
    <path d="M4 4 H24 L22 32 H6 Z" fill={filled ? '#60a5fa' : 'rgba(0,0,0,0.06)'} stroke={filled ? '#3b82f6' : '#d1d5db'} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 12 H22" stroke={filled ? '#93c5fd' : '#e5e7eb'} strokeWidth="1" />
    {filled && <path d="M8 18 Q14 14 20 18" stroke="#bfdbfe" strokeWidth="1.2" fill="none" />}
  </svg>
);

export default function WaterWidget() {
  const { glasses, goal, logGlass, reset } = useWaterTracker();
  const pct = Math.round((glasses / goal) * 100);

  const getMessage = () => {
    if (glasses === 0) return "Let's hydrate! 💧";
    if (glasses < goal / 2) return "Keep going! 💪";
    if (glasses < goal) return "Almost there! 🌊";
    return "Goal reached! 🎉";
  };

  return (
    <div className="widget-section">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>
          {glasses} / {goal} glasses
        </p>
        <p style={{ fontSize: 11, color: '#6b7280' }}>{getMessage()}</p>
      </div>

      {/* Glass grid */}
      <div className="water-grid">
        {Array.from({ length: goal }).map((_, i) => (
          <div key={i} className={`water-glass-wrap${i < glasses ? ' water-glass-filled' : ''}`}>
            {GLASS_SVG(i < glasses)}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="water-bar-track" style={{ margin: '12px 0 10px' }}>
        <div className="water-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Buttons */}
      <div className="widget-row" style={{ justifyContent: 'center', gap: 10 }}>
        <button
          className="water-btn water-btn-primary"
          onClick={logGlass}
          disabled={glasses >= goal}
        >
          💧 Log Glass
        </button>
        <button className="water-btn" onClick={reset}>↺</button>
      </div>
    </div>
  );
}
