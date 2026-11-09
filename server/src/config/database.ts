import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export async function checkDatabaseConnection(): Promise<{ isConnected: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    // Run simple lightweight query to verify connectivity to MySQL
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return { isConnected: true, latencyMs };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    return { isConnected: false, latencyMs, error: errorMessage };
  }
}
