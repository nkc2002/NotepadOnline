import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

const app = express();

// CORS configuration - Allow Frontend
const allowedOrigins = [
  'https://notepad-online-sigma.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // For development, allow all origins
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Notepad Online API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    database: 'not connected yet - testing CORS first',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cors: 'enabled for ' + allowedOrigins.join(', '),
  });
});

// Mock public notes endpoint for testing
app.get('/api/notes/public/list', (req, res) => {
  res.json({
    success: true,
    message: 'Public notes endpoint - database not connected yet',
    notes: [],
    total: 0,
    page: 1,
    limit: 12,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Export serverless handler
export default serverless(app);
