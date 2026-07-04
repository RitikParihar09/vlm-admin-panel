import React from 'react';

const CustomChart = ({ type = 'line', data = [], title }) => {
  if (!data || data.length === 0) return null;

  const renderLineChart = () => {
    const width = 500;
    const height = 180;
    const padding = 30;
    
    const maxVal = Math.max(...data.map(d => d.value)) * 1.15 || 10;
    const minVal = 0;

    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.value - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y, label: d.label, val: d.value };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area path for gradient fill
    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : '';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
        <defs>
          <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + ratio * (height - padding * 2);
          const gridVal = Math.round(maxVal - ratio * maxVal);
          return (
            <g key={idx} className="grid-group">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3,3" />
              <text x={padding - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">{gridVal}</text>
            </g>
          );
        })}

        {/* Gradient Area */}
        {areaD && <path d={areaD} fill="url(#lineGlow)" />}

        {/* Main Line */}
        {pathD && <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="glow-stroke" />}

        {/* Data Points */}
        {points.map((p, idx) => (
          <g key={idx} className="chart-dot-group">
            <circle cx={p.x} cy={p.y} r="5" fill="#111827" stroke="#06b6d4" strokeWidth="2" className="chart-dot" />
            <text x={p.x} y={height - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">{p.label}</text>
            
            {/* Tooltip text showing value above dot on hover */}
            <g className="chart-tooltip">
              <rect x={p.x - 18} y={p.y - 24} width="36" height="16" rx="4" fill="rgba(10, 15, 24, 0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <text x={p.x} y={p.y - 13} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">{p.val}</text>
            </g>
          </g>
        ))}
      </svg>
    );
  };

  const renderBarChart = () => {
    const width = 500;
    const height = 180;
    const padding = 30;
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 10;
    
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = (chartWidth / data.length) * 0.55;
    const barSpacing = (chartWidth / data.length) * 0.45;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = padding + ratio * chartHeight;
          const gridVal = Math.round(maxVal - ratio * maxVal);
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255, 255, 255, 0.05)" />
              <text x={padding - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#64748b">{gridVal}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, index) => {
          const barHeight = (d.value / maxVal) * chartHeight;
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = height - padding - barHeight;

          return (
            <g key={index} className="bar-group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="url(#barGrad)"
                className="chart-bar"
              />
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#f8fafc" fontWeight="600">{d.value}</text>
              <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">{d.label}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderDonutChart = () => {
    const width = 180;
    const height = 180;
    const radius = 60;
    const strokeWidth = 14;
    const cx = width / 2;
    const cy = height / 2;
    const circumference = 2 * Math.PI * radius;

    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    
    let accumulatedAngle = 0;
    
    const colors = ['#06b6d4', '#f59e0b', '#ec4899', '#3b82f6'];

    return (
      <div className="donut-chart-container">
        <svg width={width} height={height} className="svg-donut">
          {data.map((d, index) => {
            const percentage = d.value / total;
            const strokeDashoffset = circumference - (percentage * circumference);
            const rotation = (accumulatedAngle / total) * 360;
            accumulatedAngle += d.value;
            const color = colors[index % colors.length];

            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation - 90} ${cx} ${cy})`}
                strokeLinecap="round"
                className="donut-segment"
              />
            );
          })}
          {/* Inner Text */}
          <circle cx={cx} cy={cy} r={radius - strokeWidth / 2} fill="#121a26" />
          <text x={cx} y={cy - 2} textAnchor="middle" fontSize="14" fill="#64748b" fontWeight="600">Total Users</text>
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="20" fill="white" fontWeight="700">{total}</text>
        </svg>

        {/* Legend */}
        <div className="donut-legend">
          {data.map((d, index) => (
            <div key={index} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="legend-label">{d.label}</span>
              <span className="legend-val">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="chart-card glass-panel">
      {title && <h4 className="chart-title">{title}</h4>}
      <div className="chart-body">
        {type === 'line' && renderLineChart()}
        {type === 'bar' && renderBarChart()}
        {type === 'donut' && renderDonutChart()}
      </div>

      <style>{`
        .chart-card {
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--panel-border);
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .chart-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 8px;
        }

        .chart-body {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
        }

        .svg-chart {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .glow-stroke {
          filter: drop-shadow(0px 3px 8px rgba(6, 182, 212, 0.5));
        }

        .chart-dot-group {
          cursor: pointer;
        }

        .chart-dot-group:hover .chart-dot {
          r: 7;
          fill: #06b6d4;
          stroke: #ffffff;
        }

        .chart-tooltip {
          opacity: 0;
          transition: opacity 0.15s ease;
          pointer-events: none;
        }

        .chart-dot-group:hover .chart-tooltip {
          opacity: 1;
        }

        .chart-bar {
          transition: height 0.5s ease, y 0.5s ease;
          cursor: pointer;
        }

        .chart-bar:hover {
          filter: brightness(1.2) drop-shadow(0px 0px 8px rgba(245, 158, 11, 0.4));
        }

        .donut-chart-container {
          display: flex;
          align-items: center;
          gap: 25px;
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 500px) {
          .donut-chart-container {
            flex-direction: column;
            gap: 15px;
          }
        }

        .svg-donut {
          overflow: visible;
        }

        .donut-segment {
          transition: stroke-dashoffset 0.5s ease;
        }

        .donut-segment:hover {
          stroke-width: 17;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.2));
          cursor: pointer;
        }

        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 120px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 13px;
          gap: 8px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-label {
          color: var(--text-secondary);
          flex-grow: 1;
        }

        .legend-val {
          color: var(--text-primary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default CustomChart;
