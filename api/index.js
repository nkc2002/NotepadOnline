// Vercel Serverless Function - Native Handler
// Updated: 2025-12-09 - Fixed response format
export default function handler(req, res) {
  // Enable CORS
  const allowedOrigins = [
    'https://notepad-online-sigma.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // Route: /api or /api/
  if (pathname === '/api' || pathname === '/api/') {
    return res.status(200).json({
      success: true,
      message: 'Welcome to Notepad Online API',
      version: '2.0.1',
      timestamp: new Date().toISOString(),
      cors: 'enabled',
    });
  }

  // Route: /api/health
  if (pathname === '/api/health') {
    return res.status(200).json({
      success: true,
      status: 'ok',
      database: 'not connected yet - testing CORS first',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      cors: 'enabled for ' + allowedOrigins.join(', '),
    });
  }

  // Route: /api/notes/public/list
  if (pathname === '/api/notes/public/list' || pathname.startsWith('/api/notes/public/list')) {
    return res.status(200).json({
      success: true,
      message: 'Public notes endpoint - database not connected yet',
      data: {
        notes: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0,
        },
      },
    });
  }

  // 404 - Not Found
  return res.status(404).json({
    success: false,
    error: 'Not Found',
    path: pathname,
    message: 'The requested endpoint does not exist',
  });
}
