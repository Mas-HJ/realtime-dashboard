import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styled from 'styled-components';

interface StatusCodes {
  success: number;
  clientError: number;
  serverError: number;
}

interface DonutChartProps {
  data: StatusCodes;
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

const COLORS = {
  success: 'var(--color-success)',
  clientError: 'var(--color-warning)',
  serverError: 'var(--color-error)',
};

const LABELS = {
  success: '2xx Success',
  clientError: '4xx Client',
  serverError: '5xx Server',
};

export function DonutChartComponent({ data, title }: DonutChartProps) {
  const chartData = [
    { name: LABELS.success, value: data.success, color: COLORS.success },
    { name: LABELS.clientError, value: data.clientError, color: COLORS.clientError },
    { name: LABELS.serverError, value: data.serverError, color: COLORS.serverError },
  ].filter((d) => d.value > 0);

  const total = data.success + data.clientError + data.serverError;

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'Requests']}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
}
