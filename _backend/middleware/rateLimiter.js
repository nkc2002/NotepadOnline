import rateLimit from 'express-rate-limit';

// Rate limiter cho route tạo note: 50 requests / 15 phút / IP (development friendly)
export const createNoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 50, // Giới hạn 50 requests (increased for development)
  message: {
    error: 'Too many notes created from this IP, please try again after 15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many notes created from this IP, please try again after 15 minutes',
    });
  },
});

// Rate limiter chung cho tất cả API routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 1000, // Giới hạn 1000 requests (increased for development)
  message: {
    error: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
