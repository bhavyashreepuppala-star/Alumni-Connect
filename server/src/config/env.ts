import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also fallback to root .env if present
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required for MySQL connection'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters long').default('alumni-connect-secure-dev-secret-key-32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // LinkedIn OAuth
  LINKEDIN_CLIENT_ID: z.string().optional().default(''),
  LINKEDIN_CLIENT_SECRET: z.string().optional().default(''),
  LINKEDIN_REDIRECT_URI: z.string().optional().default('http://localhost:5000/api/auth/linkedin/callback'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),

  // Nodemailer
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default('no-reply@alumniconnect.edu'),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables configuration:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
};

export const env = parseEnv();
