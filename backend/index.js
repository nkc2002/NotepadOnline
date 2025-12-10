import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import notesRouter from './routes/notes.js';
import authRouter from './routes/auth.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Edit-Token'],
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection helper - optimized for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedDb = conn;
    console.log('MongoDB connected');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

// Health check route - no database required
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Notepad Online API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Database middleware for API routes
const ensureDB = async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return res.status(503).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
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

// Export for Vercel serverless
export default async function handler(req, res) {
  // Handle the request with Express
  return app(req, res);
}

// Also export app for local development
export { app };
