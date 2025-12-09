import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import database connection
import connectDB from './lib/mongodb.js';

// Import routes
import notesRouter from './routes/notes.js';
import authRouter from './routes/auth.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Load environment variables (optional for Vercel serverless)
try {
  dotenv.config();
} catch (e) {
  // dotenv not needed in Vercel serverless
}

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging middleware
app.use(morgan('combined'));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(503).json({
      success: false,
      error: 'Database connection failed',
      message: 'Service temporarily unavailable',
    });
  }
});

// Apply general rate limiter to all routes
app.use('/api', generalLimiter);

// Health check route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Notepad Online API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', async (req, res) => {
  const mongoose = await import('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    success: true,
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Export serverless handler
export default serverless(app);
