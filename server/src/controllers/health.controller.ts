import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';
import { env } from '../config/env';

export class HealthController {
  static async check(req: Request, res: Response) {
    const dbCheck = await checkDatabaseConnection();
    const isDegraded = !dbCheck.isConnected;

    const memoryUsage = process.memoryUsage();
    const memoryMB = {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    };

    const payload = {
      status: isDegraded ? 'degraded' : 'ok',
      service: 'Alumni Connect API',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      services: {
        backend: {
          status: 'up',
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          memory: memoryMB,
        },
        database: {
          dialect: 'MySQL 8',
          status: dbCheck.isConnected ? 'up' : 'down',
          latencyMs: dbCheck.latencyMs,
          message: dbCheck.isConnected
            ? 'Successfully connected to MySQL database via Prisma ORM'
            : `Database unreachable: ${dbCheck.error}`,
        },
      },
    };

    // Return 200 even if database is down so clients can read the granular diagnostics,
    // or 503 if explicitly requested via query param ?strict=true
    const statusCode = req.query.strict === 'true' && isDegraded ? 503 : 200;
    return res.status(statusCode).json(payload);
  }
}
