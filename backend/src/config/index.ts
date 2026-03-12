import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || '172.0.0.10',
    user: process.env.DB_USER || 'sameer',
    password: process.env.DB_PASSWORD || 'nO*dVXz0]58*',
    database: process.env.DB_NAME || 'sinch_lite',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  },
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
