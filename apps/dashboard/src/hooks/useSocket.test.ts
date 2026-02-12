import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// vi.mock is hoisted, so we must use vi.hoisted to define shared state
const { listeners, mockSocket, emit } = vi.hoisted(() => {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  const mockSocket = {
    connected: false,
    on: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(cb);
    }),
    off: vi.fn((event: string, cb: (...args: unknown[]) => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((fn) => fn !== cb);
      }
    }),
  };

  function emit(event: string, ...args: unknown[]) {
    (listeners[event] || []).forEach((cb) => cb(...args));
  }

  return { listeners, mockSocket, emit };
});

vi.mock('../lib/socket', () => ({
  socket: mockSocket,
}));

import { useSocket } from './useSocket';

describe('useSocket', () => {
  beforeEach(() => {
    // Reset listener registry & mock state
    for (const key of Object.keys(listeners)) {
      delete listeners[key];
    }
    mockSocket.connected = false;
    vi.clearAllMocks();
  });

  it('returns initial state: disconnected, null metrics, empty history', () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.connected).toBe(false);
    expect(result.current.metrics).toBeNull();
    expect(result.current.history).toEqual([]);
  });

  it('sets connected to true on connect event', () => {
    const { result } = renderHook(() => useSocket());

    act(() => emit('connect'));

    expect(result.current.connected).toBe(true);
  });

  it('sets connected to false on disconnect event', () => {
    mockSocket.connected = true;
    const { result } = renderHook(() => useSocket());

    act(() => emit('connect'));
    expect(result.current.connected).toBe(true);

    act(() => emit('disconnect'));
    expect(result.current.connected).toBe(false);
  });

  it('updates metrics and appends to history on metrics:update', () => {
    const { result } = renderHook(() => useSocket());
    const metricsData = { timestamp: 1, cpu: 50, memory: 60 };

    act(() => emit('metrics:update', metricsData));

    expect(result.current.metrics).toEqual(metricsData);
    expect(result.current.history).toEqual([metricsData]);
  });

  it('sets history and latest metrics on metrics:history', () => {
    const { result } = renderHook(() => useSocket());
    const historyData = [
      { timestamp: 1, cpu: 40 },
      { timestamp: 2, cpu: 50 },
    ];

    act(() => emit('metrics:history', historyData));

    expect(result.current.history).toEqual(historyData);
    expect(result.current.metrics).toEqual(historyData[1]); // latest
  });

  it('sets metrics to null when metrics:history receives empty array', () => {
    const { result } = renderHook(() => useSocket());

    act(() => emit('metrics:history', []));

    expect(result.current.history).toEqual([]);
    expect(result.current.metrics).toBeNull();
  });

  it('caps history at 60 items', () => {
    const { result } = renderHook(() => useSocket());

    act(() => {
      for (let i = 0; i < 70; i++) {
        emit('metrics:update', { timestamp: i, cpu: i });
      }
    });

    expect(result.current.history.length).toBe(60);
    // Should keep the most recent 60 (items 10-69)
    expect(result.current.history[0]).toEqual({ timestamp: 10, cpu: 10 });
    expect(result.current.history[59]).toEqual({ timestamp: 69, cpu: 69 });
  });

  it('removes listeners on unmount', () => {
    const { unmount } = renderHook(() => useSocket());

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('metrics:update', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('metrics:history', expect.any(Function));

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('metrics:update', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('metrics:history', expect.any(Function));
  });
});
