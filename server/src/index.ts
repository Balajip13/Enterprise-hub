import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Route Imports
import authRoutes from './routes/authRoutes';
import chapterRoutes from './routes/chapterRoutes';
import userRoutes from './routes/userRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminRoutes from './routes/adminRoutes';
import referralRoutes from './routes/referralRoutes';
import meetingRoutes from './routes/meetingRoutes';
import notificationRoutes from './routes/notificationRoutes';
import paymentRoutes from './routes/payment';
import uploadRoutes from './routes/upload';
import supportRoutes from './routes/supportRoutes';

// Middleware Imports
import { authenticateToken, authorize } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Server is running');
});

// API Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API working' });
});

// ── Public Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes);

// ── Protected Routes ────────────────────────────────────────────────────────
app.use('/api/chapters', chapterRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/admin', authenticateToken, authorize(['ADMIN']), adminRoutes);
app.use('/api/referrals', authenticateToken, referralRoutes);
app.use('/api/meetings', authenticateToken, meetingRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/leaderboard', authenticateToken, dashboardRoutes);

// ── System Routes ───────────────────────────────────────────────────────────

// Global 404 JSON Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`
  });
});

// Global Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  console.error('[System Error]:', err.stack || err.message || err);
  
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: (isDev || err.isOperational) ? (err.message || 'Internal server error') : 'Internal server error',
    ...(isDev && { stack: err.stack, details: err.toString() })
  });
});

// ── Database Connection & Server Start ─────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
