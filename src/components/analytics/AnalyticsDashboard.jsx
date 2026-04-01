import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import ScreenTimeChart from './ScreenTimeChart';
import TypingSpeedChart from './TypingSpeedChart';
import ProductivityScore from './ProductivityScore';

export default function AnalyticsDashboard() {
  const { score, last7Days, refresh } = useAnalytics();

  return (
    <div className="analytics-panel">
      {/* Header */}
      <div className="analytics-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#1e1b4b' }}>Analytics</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="icon-btn" onClick={refresh} title="Refresh">↻</button>
          <button
            className="panel-close-btn"
            onClick={() => window.electronAPI?.closeAnalytics?.()}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="analytics-body">
        <ProductivityScore score={score} />
        <ScreenTimeChart data={last7Days} />
        <TypingSpeedChart data={last7Days} />
      </div>
    </div>
  );
}
