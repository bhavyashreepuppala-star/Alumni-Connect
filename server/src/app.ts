import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { healthRoutes } from './routes/health.routes';
import { authRoutes } from './routes/auth.routes';
import { linkedinRoutes } from './routes/linkedin.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/linkedin', linkedinRoutes);

// Root greeting / status
app.get('/', (req, res) => {
  res.json({
    name: 'Alumni Connect API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Centralized 404 handler
app.use(notFound);

// Centralized Global Error Handler
app.use(errorHandler);

export { app };
