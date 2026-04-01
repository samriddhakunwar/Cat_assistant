import React, { useState } from 'react';
import PomodoroWidget from './PomodoroWidget';
import CalendarWidget from './CalendarWidget';
import TodoWidget from './TodoWidget';
import WaterWidget from './WaterWidget';

const TABS = [
  { id: 'pomodoro', label: '🍅', title: 'Pomodoro' },
  { id: 'calendar', label: '📅', title: 'Calendar' },
  { id: 'todos',    label: '✅', title: 'To-Do' },
  { id: 'water',    label: '💧', title: 'Water' },
];

export default function WidgetPanel() {
  const [activeTab, setActiveTab] = useState('pomodoro');

  return (
    <div className="widget-panel">
      {/* Header */}
      <div className="widget-panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🐱</span>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#1e1b4b' }}>Cat Widgets</span>
        </div>
        <button
          className="panel-close-btn"
          onClick={() => window.electronAPI?.closeWidgets?.()}
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Tab bar */}
      <div className="widget-tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`widget-tab${activeTab === tab.id ? ' widget-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.title}
          >
            <span>{tab.label}</span>
            <span className="widget-tab-label">{tab.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="widget-content">
        {activeTab === 'pomodoro' && <PomodoroWidget />}
        {activeTab === 'calendar' && <CalendarWidget />}
        {activeTab === 'todos'    && <TodoWidget />}
        {activeTab === 'water'    && <WaterWidget />}
      </div>
    </div>
  );
}
