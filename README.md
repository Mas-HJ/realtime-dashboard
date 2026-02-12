# Real-time Metrics Dashboard

A real-time data visualization dashboard built with React, Express, Socket.io, and Redis.

## Features

- **Live Updates**: Real-time data streaming via WebSocket
- **System Metrics**: CPU, Memory, Requests/sec, Active Connections
- **Interactive Charts**: Line, Bar, and Donut charts using Recharts
- **Dark/Light Mode**: Theme toggle support
- **Redis Pub/Sub**: Scalable real-time architecture

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Dashboard                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Line     │  │ Bar      │  │ Donut    │  │ Stats    │    │
│  │ Chart    │  │ Chart    │  │ Chart    │  │ Cards    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                         ▲                                    │
│                         │ Socket.io                          │
└─────────────────────────┼───────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                   Express API                                │
│  ┌──────────────────────┴──────────────────────┐            │
│  │           Socket.io Server                   │            │
│  └──────────────────────┬──────────────────────┘            │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────┐            │
│  │         Data Generator Service               │            │
│  └──────────────────────┬──────────────────────┘            │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │    Redis     │
                   │  (pub/sub +  │
                   │   caching)   │
                   └──────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Charts | Recharts |
| Real-time | Socket.io |
| Backend | Express.js |
| Data Store | Redis |
| Styling | Styled Components |

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for Redis)

### Installation

```bash
# Install dependencies
npm install

# Start Redis
docker-compose up -d

# Start API server (terminal 1)
npm run dev:api

# Start dashboard (terminal 2)
npm run dev:dashboard
```

### URLs

- Dashboard: http://localhost:5173
- API: http://localhost:3001
- Health Check: http://localhost:3001/health

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/metrics/current` | Current metrics snapshot |
| `GET /api/metrics/history` | Last 60 data points |
| `GET /health` | Health check |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `metrics:update` | Server → Client | Real-time metrics (every 1s) |
| `metrics:history` | Server → Client | Historical data on connect |

## Environment Variables

### API
- `PORT` - Server port (default: 3001)
- `REDIS_URL` - Redis connection URL (default: redis://localhost:6379)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:5173)

### Dashboard
- `VITE_API_URL` - API URL (default: http://localhost:3001)

## Project Structure

```
realtime-dashboard/
├── apps/
│   ├── api/                    # Express backend
│   │   └── src/
│   │       ├── index.ts        # Entry point
│   │       ├── socket.ts       # Socket.io setup
│   │       ├── redis.ts        # Redis client
│   │       ├── generator.ts    # Mock data generator
│   │       └── routes/
│   │           └── metrics.ts  # REST endpoints
│   │
│   └── dashboard/              # React frontend
│       └── src/
│           ├── App.tsx
│           ├── components/
│           │   ├── LineChart.tsx
│           │   ├── BarChart.tsx
│           │   ├── DonutChart.tsx
│           │   └── StatCard.tsx
│           ├── hooks/
│           │   └── useSocket.ts
│           └── lib/
│               └── socket.ts
│
├── docker-compose.yml          # Redis
├── package.json                # Workspace root
└── README.md
```

## License

MIT
