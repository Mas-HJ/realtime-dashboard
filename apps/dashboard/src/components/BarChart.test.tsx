import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarChartComponent } from './BarChart';

// recharts uses ResizeObserver internally
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

describe('BarChartComponent', () => {
  it('renders the chart title', () => {
    const data = [
      { name: '/api/users', requests: 45 },
      { name: '/api/products', requests: 35 },
    ];

    render(<BarChartComponent data={data} title="Requests by Endpoint" />);

    expect(screen.getByText('Requests by Endpoint')).toBeInTheDocument();
  });
});
