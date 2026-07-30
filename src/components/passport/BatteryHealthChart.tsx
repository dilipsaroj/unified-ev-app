'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Generate fake battery health data: gentle degradation from 100% to 96% over 12 months
const generateBatteryHealthData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [];
  
  for (let i = 0; i < 12; i++) {
    // Gentle decline: 100% → 96% over 12 months
    const capacityPct = 100 - (i * 0.35);
    data.push({
      month: months[i],
      capacity: parseFloat(capacityPct.toFixed(1)),
    });
  }
  
  return data;
};

const data = generateBatteryHealthData();

export default function BatteryHealthChart() {
  return (
    <div
      style={{
        width: '100%',
        height: 200,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            domain={[95, 100]}
            tick={{ fill: 'var(--color-ink-3)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--color-border)' }}
            label={{
              value: 'Capacity %',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'var(--color-ink-3)', fontSize: 11 },
            }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--color-ink)', fontWeight: 600 }}
            formatter={(value: number) => [`${value}%`, 'Battery Capacity']}
          />
          <Line
            type="monotone"
            dataKey="capacity"
            stroke="var(--color-brand-500)"
            strokeWidth={3}
            dot={{ fill: 'var(--color-brand-500)', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
