import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="CPU Usage" value={42} />);

    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders unit when provided', () => {
    render(<StatCard title="CPU Usage" value={42} unit="%" />);

    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('does not render unit when not provided', () => {
    const { container } = render(<StatCard title="Requests" value={150} />);

    // No Unit span should be present
    expect(container.querySelector('span')).toBeNull();
  });

  it('renders trend arrow and text when trendValue is provided', () => {
    render(
      <StatCard
        title="CPU Usage"
        value={42}
        trend="up"
        trendValue="Increasing"
      />,
    );

    expect(screen.getByText('Increasing')).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('renders down trend with arrow', () => {
    render(
      <StatCard
        title="Memory"
        value={60}
        trend="down"
        trendValue="Decreasing"
      />,
    );

    expect(screen.getByText('Decreasing')).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument(); // Arrow is always ↑, rotated via CSS
  });

  it('does not render trend arrow for neutral trend', () => {
    render(
      <StatCard
        title="Memory"
        value={60}
        trend="neutral"
        trendValue="Stable"
      />,
    );

    expect(screen.getByText('Stable')).toBeInTheDocument();
    expect(screen.queryByText('↑')).not.toBeInTheDocument();
  });

  it('does not render trend section when trendValue is not provided', () => {
    render(<StatCard title="Requests" value={150} />);

    expect(screen.queryByText('Increasing')).not.toBeInTheDocument();
    expect(screen.queryByText('Decreasing')).not.toBeInTheDocument();
    expect(screen.queryByText('Stable')).not.toBeInTheDocument();
  });
});
