export default function handler(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  if (pathname === '/api' || pathname === '/api/') {
    return res.status(200).json({
      success: true,
      message: 'Welcome to Notepad Online API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  }
  
  if (pathname === '/api/health') {
    return res.status(200).json({
      success: true,
      status: 'ok',
      database: 'not connected yet',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
  
  return res.status(404).json({
    success: false,
    error: 'Not Found',
    path: pathname,
  });
}

