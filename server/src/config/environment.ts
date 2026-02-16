import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT,

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_SECRET_ACCESS: process.env.JWT_SECRET_ACCESS,
  JWT_SECRET_REFRESH: process.env.JWT_SECRET_REFRESH,

  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
};