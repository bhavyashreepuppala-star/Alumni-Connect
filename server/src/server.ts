import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/database';

const server = http.createServer(app);

// Initialize Socket.IO with CORS policies
export const io = new SocketIOServer(server, {
  cors: {
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

  // Scaffolding for room subscriptions (e.g. user notifications, mentorship chat rooms)
  socket.on('join:room', (room: string) => {
    socket.join(room);
    console.log(`🔌 [Socket.IO] Client ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
  });
});

async function startServer() {
  try {
    // Initial check of MySQL database connectivity
    console.log('🔍 Checking MySQL connection via Prisma...');
    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.isConnected) {
      console.log(`✅ Connected to MySQL database in ${dbStatus.latencyMs}ms`);
    } else {
      console.warn(
        `⚠️ MySQL connection notice: ${dbStatus.error}\n(The backend server is starting in degraded mode. Please ensure MySQL 8 is running and DATABASE_URL is configured).`
      );
    }

    server.listen(env.PORT, () => {
      console.log(`🚀 Alumni Connect Backend running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`📡 Health Check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
