import { useState, useMemo } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import { useSocket } from './hooks/useSocket';
import { StatCard } from './components/StatCard';
import { LineChartComponent } from './components/LineChart';
import { BarChartComponent } from './components/BarChart';
import { DonutChartComponent } from './components/DonutChart';

const lightTheme = {
  '--bg-primary': '#f8fafc',
  '--bg-secondary': '#ffffff',
  '--card-bg': '#ffffff',
  '--text-primary': '#1e293b',
  '--text-secondary': '#64748b',
  '--border-color': '#e2e8f0',
  '--color-primary': '#3b82f6',
  '--color-secondary': '#8b5cf6',
  '--color-success': '#22c55e',
  '--color-warning': '#f59e0b',
  '--color-error': '#ef4444',
  '--color-info': '#06b6d4',
};

const darkTheme = {
  '--bg-primary': '#0f172a',
  '--bg-secondary': '#1e293b',
  '--card-bg': '#1e293b',
  '--text-primary': '#f1f5f9',
  '--text-secondary': '#94a3b8',
  '--border-color': '#334155',
  '--color-primary': '#60a5fa',
  '--color-secondary': '#a78bfa',
  '--color-success': '#4ade80',
  '--color-warning': '#fbbf24',
  '--color-error': '#f87171',
  '--color-info': '#22d3ee',
};

const GlobalStyle = createGlobalStyle<{ theme: typeof lightTheme }>`
  :root {
    ${({ theme }) =>
      Object.entries(theme)
        .map(([key, value]) => `${key}: ${value};`)
        .join('\n    ')}
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ConnectionStatus = styled.div<{ $connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--card-bg);
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
  font-weight: 500;
`;

const StatusDot = styled.span<{ $connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.$connected ? 'var(--color-success)' : 'var(--color-error)')};
  animation: ${(props) => (props.$connected ? 'pulse 2s infinite' : 'none')};

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 1.25rem;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: var(--bg-secondary);
    transform: scale(1.05);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--text-secondary);
  font-size: 1rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

function App() {
  const [isDark, setIsDark] = useState(true);
  const { connected, metrics, history } = useSocket();

  const theme = isDark ? darkTheme : lightTheme;

  const trends = useMemo(() => {
    if (history.length < 2) return { cpu: 'neutral', memory: 'neutral' };

    const recent = history.slice(-5);
    const older = history.slice(-10, -5);

    if (recent.length === 0 || older.length === 0) return { cpu: 'neutral', memory: 'neutral' };

    const avgRecentCpu = recent.reduce((a, b) => a + b.cpu, 0) / recent.length;
    const avgOlderCpu = older.reduce((a, b) => a + b.cpu, 0) / older.length;
    const avgRecentMem = recent.reduce((a, b) => a + b.memory, 0) / recent.length;
    const avgOlderMem = older.reduce((a, b) => a + b.memory, 0) / older.length;

    return {
      cpu: avgRecentCpu > avgOlderCpu + 2 ? 'up' : avgRecentCpu < avgOlderCpu - 2 ? 'down' : 'neutral',
      memory: avgRecentMem > avgOlderMem + 2 ? 'up' : avgRecentMem < avgOlderMem - 2 ? 'down' : 'neutral',
    };
  }, [history]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle theme={theme} />
      <Container>
        <Header>
          <Title>System Metrics Dashboard</Title>
          <HeaderRight>
            <ConnectionStatus $connected={connected}>
              <StatusDot $connected={connected} />
              {connected ? 'Live' : 'Disconnected'}
            </ConnectionStatus>
            <ThemeToggle onClick={() => setIsDark(!isDark)} title="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </ThemeToggle>
          </HeaderRight>
        </Header>

        {!metrics ? (
          <LoadingMessage>
            <Spinner />
            Waiting for metrics data...
          </LoadingMessage>
        ) : (
          <>
            <StatsGrid>
              <StatCard
                title="CPU Usage"
                value={metrics.cpu}
                unit="%"
                trend={trends.cpu as 'up' | 'down' | 'neutral'}
                trendValue={trends.cpu === 'up' ? 'Increasing' : trends.cpu === 'down' ? 'Decreasing' : 'Stable'}
                color="var(--color-primary)"
              />
              <StatCard
                title="Memory Usage"
                value={metrics.memory}
                unit="%"
                trend={trends.memory as 'up' | 'down' | 'neutral'}
                trendValue={trends.memory === 'up' ? 'Increasing' : trends.memory === 'down' ? 'Decreasing' : 'Stable'}
                color="var(--color-secondary)"
              />
              <StatCard
                title="Requests/sec"
                value={metrics.requestsPerSecond}
                color="var(--color-success)"
              />
              <StatCard
                title="Active Connections"
                value={metrics.activeConnections}
                color="var(--color-info)"
              />
              <StatCard
                title="Avg Response Time"
                value={metrics.responseTime}
                unit="ms"
                color="var(--color-warning)"
              />
            </StatsGrid>

            <ChartsGrid>
              <LineChartComponent data={history} title="CPU & Memory Over Time" />
              <BarChartComponent data={metrics.endpoints} title="Requests by Endpoint" />
              <DonutChartComponent data={metrics.statusCodes} title="Response Status Distribution" />
            </ChartsGrid>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
