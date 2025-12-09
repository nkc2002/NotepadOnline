import User from '../models/User.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { isDisabled } from '../lib/mongodb.js';
import { memoryStore } from '../lib/memoryStore.js';
import bcrypt from 'bcryptjs';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !validateEmail(email)) {
      return errorResponse(res, 'Valid email is required', 400);
    }

    if (!password || !validatePassword(password)) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    // Use memory store if MongoDB is disabled
    if (isDisabled()) {
      const existingUser = await memoryStore.users.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return errorResponse(res, 'Email already registered', 409);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await memoryStore.users.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name?.trim() || '',
        isActive: true,
      });

      const token = generateToken({ userId: user._id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user._id });

      return successResponse(
        res,
        {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            isActive: user.isActive,
            createdAt: user.createdAt,
          },
          token,
          refreshToken,
        },
        'User registered successfully',
        201
      );
    }

    // Use MongoDB
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 409);
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      name: name?.trim() || '',
    });

    await user.save();

    const token = generateToken({
      userId: user._id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id,
    });

    return successResponse(
      res,
      {
        user: user.toPublicJSON(),
        token,
        refreshToken,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return errorResponse(res, 'Validation failed', 400, messages);
    }

    return errorResponse(res, 'Registration failed', 500);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !validateEmail(email)) {
      return errorResponse(res, 'Valid email is required', 400);
    }

    if (!password) {
      return errorResponse(res, 'Password is required', 400);
    }

    // Find user by email (include password field)
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('+password');

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Account has been disabled', 401);
    }

    // Verify password (using bcrypt compare)
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Update last login timestamp
    await user.updateLastLogin();

    // Generate tokens
    const token = generateToken({
      userId: user._id,
      email: user.email,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id,
    });

    return successResponse(
      res,
      {
        user: user.toPublicJSON(),
        token,
        refreshToken,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    // In a stateless JWT setup, logout is handled client-side
    // If using refresh tokens with database storage, invalidate them here
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    return successResponse(
      res,
      {
        user: req.user.toPublicJSON(),
      },
      'User profile retrieved successfully'
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to get profile', 500);
  }
};

/**
 * Update user profile
 * PUT /api/auth/me
 */
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    // Update only allowed fields
    if (name !== undefined) {
      req.user.name = name.trim();
    }

    await req.user.save();

    return successResponse(
      res,
      {
        user: req.user.toPublicJSON(),
      },
      'Profile updated successfully'
    );
  } catch (error) {
    console.error('Update profile error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return errorResponse(res, 'Validation failed', 400, messages);
    }

    return errorResponse(res, 'Failed to update profile', 500);
  }
};

/**
 * Change password
 * PUT /api/auth/password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current and new password are required', 400);
    }

    if (!validatePassword(newPassword)) {
      return errorResponse(res, 'New password must be at least 6 characters', 400);
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Failed to change password', 500);
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
};
