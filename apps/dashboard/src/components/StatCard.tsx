import styled from 'styled-components';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

const Card = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
`;

const Value = styled.div<{ $color?: string }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.$color || 'var(--text-primary)'};
  line-height: 1;
`;

const Unit = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const TrendContainer = styled.div<{ $trend: 'up' | 'down' | 'neutral' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${(props) => {
    switch (props.$trend) {
      case 'up':
        return 'var(--color-success)';
      case 'down':
        return 'var(--color-error)';
      default:
        return 'var(--text-secondary)';
    }
  }};
`;

const TrendArrow = styled.span<{ $trend: 'up' | 'down' | 'neutral' }>`
  display: inline-block;
  transform: ${(props) => (props.$trend === 'down' ? 'rotate(180deg)' : 'none')};
`;

export function StatCard({ title, value, unit, trend = 'neutral', trendValue, color }: StatCardProps) {
  return (
    <Card>
      <Title>{title}</Title>
      <ValueContainer>
        <Value $color={color}>{value}</Value>
        {unit && <Unit>{unit}</Unit>}
      </ValueContainer>
      {trendValue && (
        <TrendContainer $trend={trend}>
          {trend !== 'neutral' && <TrendArrow $trend={trend}>↑</TrendArrow>}
          {trendValue}
        </TrendContainer>
      )}
    </Card>
  );
}
