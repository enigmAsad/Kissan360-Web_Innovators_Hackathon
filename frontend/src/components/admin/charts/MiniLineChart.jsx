import React, { useMemo, useState } from 'react';

// Lightweight SVG line chart with hover tooltip
const MiniLineChart = ({ data, width = 280, height = 120, padding = 16 }) => {
  const [hover, setHover] = useState(null);

  const { points, xScale, yScale, dates } = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return { points: '', xScale: () => 0, yScale: () => 0, dates: [] };
    }
    const values = data.map(d => Number(d.price));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const dx = (width - padding * 2) / (data.length - 1 || 1);
    const xScale = (i) => padding + i * dx;
    const yScale = (v) => {
      if (max === min) return height / 2; // flat line
      return padding + (height - padding * 2) * (1 - (v - min) / (max - min));
    };
    const pts = data.map((d, i) => `${xScale(i)},${yScale(Number(d.price))}`).join(' ');
    const dates = data.map(d => d.date);
    return { points: pts, xScale, yScale, dates };
  }, [data, width, height, padding]);

  if (!data || data.length === 0) {
    return <div style={{ color: '#94a3b8' }}>No data</div>;
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height}>
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        {/* axes baseline */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" strokeWidth="1" />
        <polyline fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" points={points} />
        {data.map((d, i) => (
          <g key={i}
             onMouseEnter={() => setHover({ i, d })}
             onMouseLeave={() => setHover(null)}>
            <circle cx={xScale(i)} cy={hover?.i === i ? undefined : undefined} r={0} />
            <circle cx={xScale(i)} cy={hover?.i === i ? undefined : undefined} r={0} />
          </g>
        ))}
        {/* hover marker */}
        {hover && (
          <g>
            <line x1={xScale(hover.i)} x2={xScale(hover.i)} y1={padding} y2={height - padding} stroke="#64748b" strokeDasharray="4 4" />
            <circle cx={xScale(hover.i)} cy={(function(){
              const values = data.map(d => Number(d.price));
              const min = Math.min(...values);
              const max = Math.max(...values);
              const yScale = (v) => {
                if (max === min) return height / 2;
                return padding + (height - padding * 2) * (1 - (v - min) / (max - min));
              };
              return yScale(Number(hover.d.price));
            })()} r={4} fill="#8b5cf6" stroke="#c4b5fd" />
          </g>
        )}
      </svg>
      {hover && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(Math.max(0, xScale(hover.i) - 60), width - 120),
            top: 8,
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(148,163,184,0.2)',
            color: '#e2e8f0',
            padding: '8px 10px',
            borderRadius: 10,
            pointerEvents: 'none',
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 700 }}>{hover.d.date}</div>
          <div>Price: {hover.d.price}</div>
        </div>
      )}
    </div>
  );
};

export default MiniLineChart;


