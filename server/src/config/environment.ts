import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isProduction = NODE_ENV === 'production';

const getEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const requireInProduction = (key: string): string | undefined => {
  const value = getEnv(key);
  if (isProduction && !value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${key}`);
  }
  return value;
};

const parseCorsOrigins = (): string[] => {
  const rawOrigins = getEnv('CORS_ORIGINS');
  if (rawOrigins) {
    return rawOrigins
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  return NODE_ENV === 'production'
    ? []
    : ['http://localhost:8080', 'http://localhost:5173'];
};

export const ENV = {
  NODE_ENV,
  PORT: getEnv('PORT') ?? '3000',
  CORS_ORIGINS: parseCorsOrigins(),

  MONGODB_URI: requireInProduction('MONGODB_URI') ?? getEnv('MONGODB_URI'),

  JWT_SECRET_ACCESS:
    requireInProduction('JWT_SECRET_ACCESS') ?? getEnv('JWT_SECRET_ACCESS'),
  JWT_SECRET_REFRESH:
    requireInProduction('JWT_SECRET_REFRESH') ?? getEnv('JWT_SECRET_REFRESH'),

  CLOUD_NAME: requireInProduction('CLOUD_NAME') ?? getEnv('CLOUD_NAME'),
  CLOUD_API_KEY: requireInProduction('CLOUD_API_KEY') ?? getEnv('CLOUD_API_KEY'),
  CLOUD_API_SECRET:
    requireInProduction('CLOUD_API_SECRET') ?? getEnv('CLOUD_API_SECRET'),
};