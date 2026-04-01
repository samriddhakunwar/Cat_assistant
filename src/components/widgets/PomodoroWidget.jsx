import React, { useCallback } from 'react';
import { usePomodoro } from '../../hooks/usePomodoro';

const SIZE = 130;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function PomodoroWidget() {
  const {
    mode, timeLeft, isRunning, sessionsCompleted,
    workMinutes, breakMinutes,
    start, pause, reset, skip,
  } = usePomodoro();

  const totalSecs = (mode === 'work' ? workMinutes : breakMinutes) * 60;
  const progress = timeLeft / totalSecs;
  const dashOffset = CIRC * (1 - progress);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const modeColor = mode === 'work' ? '#f472b6' : '#34d399';
  const modeBg = mode === 'work'
    ? 'linear-gradient(135deg,#fce7f3,#ede9fe)'
    : 'linear-gradient(135deg,#d1fae5,#e0f2fe)';

  return (
    <div className="widget-section" style={{ background: modeBg, borderRadius: 20, padding: '18px 12px' }}>
      {/* Mode label */}
      <div className="widget-row" style={{ justifyContent: 'center', marginBottom: 10 }}>
        <span className="mode-badge" style={{ background: modeColor }}>
          {mode === 'work' ? '🍅 Focus' : '☕ Break'}
        </span>
      </div>

      {/* SVG Ring */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={modeColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 26, fontWeight: 800, color: '#1e1b4b', letterSpacing: '-1px',
        }}>
          {fmt(timeLeft)}
        </span>
      </div>

      {/* Session dots */}
      <div className="widget-row" style={{ justifyContent: 'center', gap: 6, margin: '10px 0' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="session-dot" style={{
            background: i < sessionsCompleted % 4 ? modeColor : 'rgba(0,0,0,0.12)',
          }} />
        ))}
      </div>

      {/* Controls */}
      <div className="widget-row" style={{ justifyContent: 'center', gap: 10 }}>
        <button className="pom-btn" onClick={reset} title="Reset">↺</button>
        <button className="pom-btn pom-btn-primary" style={{ background: modeColor }} onClick={isRunning ? pause : start}>
          {isRunning ? '⏸' : '▶'}
        </button>
        <button className="pom-btn" onClick={skip} title="Skip">⏭</button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', marginTop: 8 }}>
        Sessions today: <strong>{Math.floor(sessionsCompleted)}</strong>
      </p>
    </div>
  );
}
