import { useEffect, useState, useCallback } from 'react';
import { socket } from '../lib/socket';

export interface Metrics {
  timestamp: number;
  cpu: number;
  memory: number;
  requestsPerSecond: number;
  activeConnections: number;
  responseTime: number;
  endpoints: {
    name: string;
    requests: number;
  }[];
  statusCodes: {
    success: number;
    clientError: number;
    serverError: number;
  };
}

const MAX_HISTORY = 60;

export function useSocket() {
  const [connected, setConnected] = useState(socket.connected);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [history, setHistory] = useState<Metrics[]>([]);

  const addToHistory = useCallback((newMetrics: Metrics) => {
    setHistory((prev) => {
      const updated = [...prev, newMetrics];
      if (updated.length > MAX_HISTORY) {
        return updated.slice(-MAX_HISTORY);
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onMetricsUpdate(data: Metrics) {
      setMetrics(data);
      addToHistory(data);
    }

    function onMetricsHistory(data: Metrics[]) {
      setHistory(data);
      if (data.length > 0) {
        setMetrics(data[data.length - 1]);
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('metrics:update', onMetricsUpdate);
    socket.on('metrics:history', onMetricsHistory);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('metrics:update', onMetricsUpdate);
      socket.off('metrics:history', onMetricsHistory);
    };
  }, [addToHistory]);

  return { connected, metrics, history };
}
