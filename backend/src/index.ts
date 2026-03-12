import express from 'express';
import cors from 'cors';
import { config } from './config';
import { checkConnection } from './db/connection';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import employeesRoutes from './routes/employees';
import attendanceRoutes from './routes/attendance';
import { setupSwagger } from './swagger';

const app = express();

app.use(cors({
  origin: config.nodeEnv === 'development'
    ? [/^http:\/\/localhost(:\d+)?$/]
    : config.frontendUrl,
  credentials: true,
}));
app.use(express.json());

app.get('/health', async (_req, res) => {
  const dbOk = await checkConnection();
  res.status(200).json({ status: 'ok', database: dbOk ? 'connected' : 'disconnected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', authMiddleware, employeesRoutes);
app.use('/api/attendance', authMiddleware, attendanceRoutes);

setupSwagger(app, '/api');

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`HRMS Lite API running on port ${config.port}`);
  console.log(`Swagger: http://localhost:${config.port}/api/api-docs`);
});
