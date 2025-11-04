import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import './TrendChart.scss';

const TrendChart = ({ data, itemName }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipValue = (value) => {
    return value !== null ? `PKR ${value}` : 'No data';
  };

  return (
    <div className="trend-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.2)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="rgba(255, 255, 255, 0.7)"
            style={{ fontSize: '0.875rem' }}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.7)"
            style={{ fontSize: '0.875rem' }}
            label={{ value: 'Price (PKR)', angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <Tooltip
            formatter={formatTooltipValue}
            labelFormatter={formatDate}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              borderRadius: '8px',
              color: '#fff',
            }}
            itemStyle={{ color: '#8b5cf6' }}
          />
          <Legend
            wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', r: 5 }}
            activeDot={{ r: 7 }}
            name={`${itemName} Price`}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="chart-note">
        <p>Note: Missing prices are carried forward from the previous available date</p>
      </div>
    </div>
  );
};

export default TrendChart;

