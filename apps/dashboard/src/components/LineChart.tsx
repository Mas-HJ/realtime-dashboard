import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import styled from 'styled-components';
import type { Metrics } from '../hooks/useSocket';

interface LineChartProps {
  data: Metrics[];
  title: string;
}

const ChartContainer = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  height: 100%;
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ChartWrapper = styled.div`
  height: 250px;
`;

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
  });
}

export function LineChartComponent({ data, title }: LineChartProps) {
  const chartData = data.map((d) => ({
    time: formatTime(d.timestamp),
    cpu: d.cpu,
    memory: d.memory,
  }));

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="time"
              stroke="var(--text-secondary)"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="var(--text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--text-primary)' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="cpu"
              name="CPU"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="memory"
              name="Memory"
              stroke="var(--color-secondary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
}
