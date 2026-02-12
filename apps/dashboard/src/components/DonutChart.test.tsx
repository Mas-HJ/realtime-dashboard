import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DonutChartComponent } from './DonutChart';

// recharts uses ResizeObserver internally
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

describe('DonutChartComponent', () => {
  it('renders the chart title', () => {
    const data = { success: 180, clientError: 15, serverError: 5 };

    render(<DonutChartComponent data={data} title="Response Status Distribution" />);

    expect(screen.getByText('Response Status Distribution')).toBeInTheDocument();
  });
});
