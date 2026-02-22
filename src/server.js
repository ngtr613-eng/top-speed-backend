import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/auth.js';

import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import modificationRoutes from './routes/modificationRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import configuratorRoutes from './routes/configuratorRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';

dotenv.config();

import serverless from 'serverless-http';

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5175',
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'https://top-speed-frontend120.vercel.app',
      'https://*.vercel.app',
    ],
    credentials: true,
  })
);

// محاولة الاتصال بـ MongoDB (بدون إعطال البرنامج إذا فشل)
connectDB().catch(err => {
  console.warn('⚠️ Database initialization warning');
});

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/modifications', modificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/configurator', configuratorRoutes);
app.use('/api/service', serviceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.use(errorHandler);

// Local development: start a server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ TOP SPEED Backend running on http://localhost:${PORT}`);
  });
}

// Export serverless handler for Vercel
export default serverless(app);
