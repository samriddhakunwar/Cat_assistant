import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function ScreenTimeChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">🖥 Screen Time (min/day)</h3>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 10, fontSize: 12 }}
            formatter={(v) => [`${Math.round(v)} min`, 'Screen Time']}
          />
          <Area type="monotone" dataKey="screenMins" stroke="#a78bfa" strokeWidth={2} fill="url(#screenGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
