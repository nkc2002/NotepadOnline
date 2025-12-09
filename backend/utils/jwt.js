import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * Generate JWT token for authenticated user
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - User data to encode in token
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Generate edit token for guest notes (32 bytes hex)
 * @returns {string} Edit token
 */
export const generateEditToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash edit token for storage
 * @param {string} token - Plain edit token
 * @returns {string} Hashed token
 */
export const hashEditToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify edit token against hashed version
 * @param {string} token - Plain edit token
 * @param {string} hashedToken - Hashed token from database
 * @returns {boolean} True if tokens match
 */
export const verifyEditToken = (token, hashedToken) => {
  const hash = hashEditToken(token);
  return hash === hashedToken;
};

/**
 * Decode JWT without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} Decoded token
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateEditToken,
  hashEditToken,
  verifyEditToken,
  decodeToken,
};

