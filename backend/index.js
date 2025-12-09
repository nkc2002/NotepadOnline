import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';

// Import database connection
import connectDB from './lib/mongodb.js';

// Import routes
import notesRouter from './routes/notes.js';
import authRouter from './routes/auth.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables (optional for Vercel serverless)
try {
  dotenv.config();
} catch (e) {
  // dotenv not needed in Vercel serverless
}

const app = express();

// CORS configuration - SIMPLE
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route - TRƯỚC database middleware để không bị block
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Notepad Online API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.json({
      success: true,
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.json({
      success: true,
      status: 'ok',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error.message,
    });
  }
});

// Database connection helper
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(503).json({
      success: false,
      error: 'Database connection failed',
      message: 'Service temporarily unavailable',
    });
  }
};

// API routes - with database middleware
app.use('/api/notes', ensureDB, notesRouter);
app.use('/api/auth', ensureDB, authRouter);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Export serverless handler
export default serverless(app);
