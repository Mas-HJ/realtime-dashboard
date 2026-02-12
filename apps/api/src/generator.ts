import { publishMetrics, cacheMetrics } from './redis.js';

interface Metrics {
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

// State for generating realistic patterns
let cpuBase = 45;
let memoryBase = 50;
let requestsBase = 150;
let connectionsBase = 25;

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function generateCPU(): number {
  // Gradual drift with occasional spikes
  cpuBase += randomInRange(-2, 2);
  cpuBase = clamp(cpuBase, 20, 70);

  // 10% chance of a spike
  const spike = Math.random() < 0.1 ? randomInRange(10, 25) : 0;
  return clamp(cpuBase + spike + randomInRange(-3, 3), 5, 95);
}

function generateMemory(): number {
  // Memory tends to grow slowly and occasionally drop (garbage collection)
  memoryBase += randomInRange(-0.5, 1);

  // 5% chance of GC drop
  if (Math.random() < 0.05) {
    memoryBase -= randomInRange(5, 15);
  }

  memoryBase = clamp(memoryBase, 30, 85);
  return clamp(memoryBase + randomInRange(-2, 2), 20, 90);
}

function generateRequests(): number {
  // Requests fluctuate more
  requestsBase += randomInRange(-10, 10);
  requestsBase = clamp(requestsBase, 50, 300);
  return Math.round(requestsBase + randomInRange(-20, 20));
}

function generateConnections(): number {
  connectionsBase += randomInRange(-2, 2);
  connectionsBase = clamp(connectionsBase, 10, 100);
  return Math.round(connectionsBase + randomInRange(-5, 5));
}

function generateEndpointStats(): { name: string; requests: number }[] {
  const endpoints = [
    { name: '/api/users', base: 45 },
    { name: '/api/products', base: 35 },
    { name: '/api/orders', base: 25 },
    { name: '/api/auth', base: 20 },
    { name: '/api/search', base: 15 },
  ];

  return endpoints.map((ep) => ({
    name: ep.name,
    requests: Math.round(ep.base + randomInRange(-10, 15)),
  }));
}

function generateStatusCodes(totalRequests: number): Metrics['statusCodes'] {
  // Mostly successful, occasional errors
  const errorRate = Math.random() < 0.1 ? randomInRange(0.05, 0.15) : randomInRange(0.01, 0.05);
  const serverErrorRate = Math.random() < 0.05 ? randomInRange(0.01, 0.05) : randomInRange(0, 0.01);

  const serverErrors = Math.round(totalRequests * serverErrorRate);
  const clientErrors = Math.round(totalRequests * errorRate);
  const success = totalRequests - clientErrors - serverErrors;

  return {
    success: Math.max(0, success),
    clientError: clientErrors,
    serverError: serverErrors,
  };
}

export function generateMetrics(): Metrics {
  const requestsPerSecond = generateRequests();

  return {
    timestamp: Date.now(),
    cpu: Number(generateCPU().toFixed(1)),
    memory: Number(generateMemory().toFixed(1)),
    requestsPerSecond,
    activeConnections: generateConnections(),
    responseTime: Math.round(randomInRange(20, 150)),
    endpoints: generateEndpointStats(),
    statusCodes: generateStatusCodes(requestsPerSecond),
  };
}

let intervalId: NodeJS.Timeout | null = null;

export function startGenerator(): void {
  if (intervalId) return;

  console.log('✓ Data generator started');

  // Generate immediately
  const emit = async () => {
    const metrics = generateMetrics();
    await cacheMetrics(metrics);
    await publishMetrics(metrics);
  };

  emit();
  intervalId = setInterval(emit, 1000);
}

export function stopGenerator(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('Data generator stopped');
  }
}
