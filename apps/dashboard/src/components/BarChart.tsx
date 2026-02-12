import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import styled from 'styled-components';

interface EndpointData {
  name: string;
  requests: number;
}

interface BarChartProps {
  data: EndpointData[];
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

const COLORS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-info)',
];

export function BarChartComponent({ data, title }: BarChartProps) {
  const chartData = data.map((d) => ({
    name: d.name.replace('/api/', ''),
    requests: d.requests,
  }));

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
            <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--text-primary)' }}
              cursor={{ fill: 'var(--border-color)', opacity: 0.3 }}
            />
            <Bar dataKey="requests" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
}
