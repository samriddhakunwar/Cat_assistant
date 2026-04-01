import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function TypingSpeedChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">⌨️ Active Typing (min/day)</h3>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 10, fontSize: 12 }}
            formatter={(v) => [`${Math.round(v)} min`, 'Typing']}
          />
          <Line
            type="monotone"
            dataKey="typingMins"
            stroke="#f472b6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#f472b6', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
