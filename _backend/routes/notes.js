import express from 'express';
import { createNoteLimiter } from '../middleware/rateLimiter.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { noteEditAuth, noteViewAuth } from '../middleware/noteAuth.js';
import * as noteController from '../controllers/noteController.js';

const router = express.Router();

// Public routes
// GET /api/notes/public/list - Get all public notes (no auth required)
router.get('/public/list', noteController.getPublicNotes);

// GET /api/notes/share/:shareId - Get note by shareId (public read-only, no auth required)
router.get('/share/:shareId', noteController.getNoteByShareId);

// POST /api/notes - Create note (rate limited, optional auth)
// - Guest can only create public notes
// - User can create private or public notes
// - Automatically generates shareId
router.post('/', createNoteLimiter, optionalAuth, noteController.createNote);

// Protected routes (require authentication)
// GET /api/notes - Get all notes for authenticated user
router.get('/', authenticate, noteController.getUserNotes);

// GET /api/notes/:id - Get single note by ID (requires view permission)
router.get('/:id', noteViewAuth, noteController.getNoteById);

// PUT /api/notes/:id - Update note (requires edit permission: JWT or editToken)
router.put('/:id', noteEditAuth, noteController.updateNote);

// DELETE /api/notes/:id - Delete note (requires edit permission: JWT or editToken)
router.delete('/:id', noteEditAuth, noteController.deleteNote);

export default router;

