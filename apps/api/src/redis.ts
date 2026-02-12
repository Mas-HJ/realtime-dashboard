import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL);
export const publisher = new Redis(REDIS_URL);
export const subscriber = new Redis(REDIS_URL);

redis.on('connect', () => {
  console.log('✓ Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

export const CHANNELS = {
  METRICS: 'metrics:update',
} as const;

export async function publishMetrics(metrics: object): Promise<void> {
  await publisher.publish(CHANNELS.METRICS, JSON.stringify(metrics));
}

export async function cacheMetrics(metrics: object): Promise<void> {
  const key = `metrics:${Date.now()}`;
  await redis.setex(key, 120, JSON.stringify(metrics)); // Keep for 2 minutes
  await redis.lpush('metrics:history', JSON.stringify(metrics));
  await redis.ltrim('metrics:history', 0, 59); // Keep last 60 entries
}

export async function getMetricsHistory(): Promise<object[]> {
  const history = await redis.lrange('metrics:history', 0, 59);
  return history.map((item) => JSON.parse(item)).reverse();
}

export async function getCurrentMetrics(): Promise<object | null> {
  const latest = await redis.lindex('metrics:history', 0);
  return latest ? JSON.parse(latest) : null;
}
