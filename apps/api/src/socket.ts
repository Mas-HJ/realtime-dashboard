import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { subscriber, CHANNELS, getMetricsHistory } from './redis.js';

let io: Server;

export function setupSocket(httpServer: HttpServer): Server {
  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ];

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', async (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send historical data on connection
    try {
      const history = await getMetricsHistory();
      socket.emit('metrics:history', history);
    } catch (err) {
      console.error('Error sending history:', err);
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Subscribe to Redis and broadcast to all clients
  subscriber.subscribe(CHANNELS.METRICS, (err) => {
    if (err) {
      console.error('Failed to subscribe:', err);
      return;
    }
    console.log('✓ Subscribed to metrics channel');
  });

  subscriber.on('message', (channel, message) => {
    if (channel === CHANNELS.METRICS) {
      io.emit('metrics:update', JSON.parse(message));
    }
  });

  return io;
}

export function getIO(): Server {
  return io;
}
