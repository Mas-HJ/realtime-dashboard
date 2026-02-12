import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ioredis before importing the module under test
vi.mock('ioredis', () => {
  class RedisMock {
    publish = vi.fn().mockResolvedValue(1);
    setex = vi.fn().mockResolvedValue('OK');
    lpush = vi.fn().mockResolvedValue(1);
    ltrim = vi.fn().mockResolvedValue('OK');
    lrange = vi.fn().mockResolvedValue([]);
    lindex = vi.fn().mockResolvedValue(null);
    on = vi.fn().mockReturnThis();
  }
  return { default: RedisMock };
});

import { publishMetrics, cacheMetrics, getMetricsHistory, getCurrentMetrics, redis, publisher, CHANNELS } from './redis.js';

describe('publishMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('publishes JSON to the correct channel', async () => {
    const data = { cpu: 50, memory: 60 };
    await publishMetrics(data);

    expect(publisher.publish).toHaveBeenCalledWith(
      CHANNELS.METRICS,
      JSON.stringify(data),
    );
  });
});

describe('cacheMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls setex with TTL 120', async () => {
    const data = { cpu: 45 };
    await cacheMetrics(data);

    expect(redis.setex).toHaveBeenCalledWith(
      expect.stringMatching(/^metrics:\d+$/),
      120,
      JSON.stringify(data),
    );
  });

  it('pushes to metrics:history list', async () => {
    const data = { cpu: 45 };
    await cacheMetrics(data);

    expect(redis.lpush).toHaveBeenCalledWith('metrics:history', JSON.stringify(data));
  });

  it('trims history to 60 entries', async () => {
    const data = { cpu: 45 };
    await cacheMetrics(data);

    expect(redis.ltrim).toHaveBeenCalledWith('metrics:history', 0, 59);
  });
});

describe('getMetricsHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses and reverses results from Redis', async () => {
    const items = [
      JSON.stringify({ cpu: 30 }),
      JSON.stringify({ cpu: 20 }),
      JSON.stringify({ cpu: 10 }),
    ];
    (redis.lrange as ReturnType<typeof vi.fn>).mockResolvedValue(items);

    const result = await getMetricsHistory();

    expect(redis.lrange).toHaveBeenCalledWith('metrics:history', 0, 59);
    expect(result).toEqual([{ cpu: 10 }, { cpu: 20 }, { cpu: 30 }]);
  });

  it('returns empty array when no history', async () => {
    (redis.lrange as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await getMetricsHistory();
    expect(result).toEqual([]);
  });
});

describe('getCurrentMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns parsed object when data exists', async () => {
    const data = { cpu: 55, memory: 70 };
    (redis.lindex as ReturnType<typeof vi.fn>).mockResolvedValue(JSON.stringify(data));

    const result = await getCurrentMetrics();
    expect(result).toEqual(data);
  });

  it('returns null when no data', async () => {
    (redis.lindex as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const result = await getCurrentMetrics();
    expect(result).toBeNull();
  });
});
