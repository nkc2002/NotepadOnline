import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

const app = express();

// CORS
app.use(cors({ origin: '*' }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple routes WITHOUT database
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Notepad Online API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    database: 'not connected yet',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  });
});

export default serverless(app);

