import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateMetrics, startGenerator, stopGenerator } from './generator.js';

describe('generateMetrics', () => {
  it('returns an object with the correct shape', () => {
    const metrics = generateMetrics();

    expect(metrics).toHaveProperty('timestamp');
    expect(metrics).toHaveProperty('cpu');
    expect(metrics).toHaveProperty('memory');
    expect(metrics).toHaveProperty('requestsPerSecond');
    expect(metrics).toHaveProperty('activeConnections');
    expect(metrics).toHaveProperty('responseTime');
    expect(metrics).toHaveProperty('endpoints');
    expect(metrics).toHaveProperty('statusCodes');

    expect(typeof metrics.timestamp).toBe('number');
    expect(typeof metrics.cpu).toBe('number');
    expect(typeof metrics.memory).toBe('number');
    expect(typeof metrics.requestsPerSecond).toBe('number');
    expect(typeof metrics.activeConnections).toBe('number');
    expect(typeof metrics.responseTime).toBe('number');
    expect(Array.isArray(metrics.endpoints)).toBe(true);
    expect(metrics.endpoints.length).toBe(5);
    expect(metrics.statusCodes).toHaveProperty('success');
    expect(metrics.statusCodes).toHaveProperty('clientError');
    expect(metrics.statusCodes).toHaveProperty('serverError');
  });

  it('generates values within defined ranges over 100 iterations', () => {
    for (let i = 0; i < 100; i++) {
      const metrics = generateMetrics();

      expect(metrics.cpu).toBeGreaterThanOrEqual(5);
      expect(metrics.cpu).toBeLessThanOrEqual(95);

      expect(metrics.memory).toBeGreaterThanOrEqual(20);
      expect(metrics.memory).toBeLessThanOrEqual(90);

      expect(metrics.responseTime).toBeGreaterThanOrEqual(20);
      expect(metrics.responseTime).toBeLessThanOrEqual(150);

      expect(metrics.requestsPerSecond).toBeGreaterThanOrEqual(0);
      expect(metrics.activeConnections).toBeGreaterThanOrEqual(0);
    }
  });

  it('status code totals equal requestsPerSecond', () => {
    for (let i = 0; i < 50; i++) {
      const metrics = generateMetrics();
      const total =
        metrics.statusCodes.success +
        metrics.statusCodes.clientError +
        metrics.statusCodes.serverError;

      expect(total).toBe(metrics.requestsPerSecond);
    }
  });

  it('each endpoint has name and requests fields', () => {
    const metrics = generateMetrics();
    for (const ep of metrics.endpoints) {
      expect(typeof ep.name).toBe('string');
      expect(typeof ep.requests).toBe('number');
    }
  });
});

describe('startGenerator / stopGenerator lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mock('./redis.js', () => ({
      publishMetrics: vi.fn().mockResolvedValue(undefined),
      cacheMetrics: vi.fn().mockResolvedValue(undefined),
    }));
  });

  afterEach(() => {
    stopGenerator();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('startGenerator begins emitting and stopGenerator stops it', async () => {
    const { publishMetrics, cacheMetrics } = await import('./redis.js');

    startGenerator();

    // The first emit happens synchronously
    await vi.advanceTimersByTimeAsync(0);
    expect(cacheMetrics).toHaveBeenCalled();
    expect(publishMetrics).toHaveBeenCalled();

    const callsBefore = (publishMetrics as ReturnType<typeof vi.fn>).mock.calls.length;

    // Advance 3 seconds — should trigger 3 more interval callbacks
    await vi.advanceTimersByTimeAsync(3000);
    const callsAfter = (publishMetrics as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(callsAfter).toBeGreaterThan(callsBefore);

    stopGenerator();

    const callsAfterStop = (publishMetrics as ReturnType<typeof vi.fn>).mock.calls.length;
    await vi.advanceTimersByTimeAsync(3000);
    expect((publishMetrics as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterStop);
  });

  it('calling startGenerator twice does not create duplicate intervals', async () => {
    const { publishMetrics } = await import('./redis.js');

    startGenerator();
    startGenerator(); // should be a no-op

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(1000);

    // Should have 2 calls (initial + 1 interval), not 4
    expect((publishMetrics as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });
});
