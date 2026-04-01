import React, { useState } from 'react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarWidget() {
  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const prev = () => setView(v => {
    const m = v.month - 1;
    return m < 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: m };
  });
  const next = () => setView(v => {
    const m = v.month + 1;
    return m > 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: m };
  });

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  // Pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d) =>
    d === today.getDate() && view.month === today.getMonth() && view.year === today.getFullYear();

  return (
    <div className="widget-section">
      {/* Header */}
      <div className="widget-row" style={{ alignItems: 'center', marginBottom: 12 }}>
        <button className="cal-nav" onClick={prev}>‹</button>
        <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#1e1b4b' }}>
          {MONTHS[view.month]} {view.year}
        </span>
        <button className="cal-nav" onClick={next}>›</button>
      </div>

      {/* Day-of-week headers */}
      <div className="cal-grid">
        {DAYS.map(d => (
          <div key={d} className="cal-dow">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`cal-day${d ? '' : ' cal-empty'}${isToday(d) ? ' cal-today' : ''}`}
          >
            {d || ''}
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 10 }}>
        {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}
