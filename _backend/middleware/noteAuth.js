import Note from '../models/Note.js';
import { optionalAuth } from './auth.js';

/**
 * Middleware to verify edit permission for notes
 * Supports both authenticated users (JWT) and guest users (editToken)
 *
 * For authenticated users: Must be the owner of the note
 * For guest notes: Must provide valid editToken in header or body
 */
export const verifyNoteEditPermission = async (req, res, next) => {
  try {
    const noteId = req.params.id;
    const editToken = req.headers['x-edit-token'] || req.body.editToken || req.query.editToken;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        error: 'Note ID is required',
      });
    }

    // Find note and include editToken field
    const note = await Note.findById(noteId).select('+editToken');

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }

    // Check if note is expired
    if (note.isExpired()) {
      return res.status(410).json({
        success: false,
        error: 'Note has expired',
      });
    }

    // Case 1: Note belongs to authenticated user
    if (note.owner) {
      // User must be authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'This note belongs to a registered user',
        });
      }

      // User must be the owner
      if (note.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Permission denied',
          message: 'You do not have permission to edit this note',
        });
      }

      // User is authenticated and is the owner
      req.note = note;
      req.isOwner = true;
      return next();
    }

    // Case 2: Guest note (owner = null)
    if (!editToken) {
      return res.status(401).json({
        success: false,
        error: 'Edit token required',
        message: 'Please provide edit token in X-Edit-Token header or editToken field',
      });
    }

    // Verify edit token
    if (!(await note.verifyEditToken(editToken))) {
      return res.status(403).json({
        success: false,
        error: 'Invalid edit token',
        message: 'The provided edit token is incorrect',
      });
    }

    // Edit token is valid
    req.note = note;
    req.isOwner = false;
    req.isGuest = true;
    next();
  } catch (error) {
    console.error('Note edit permission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify edit permission',
      message: error.message,
    });
  }
};

/**
 * Middleware to verify view permission for notes
 * Public notes can be viewed by anyone
 * Private notes require authentication and ownership
 */
export const verifyNoteViewPermission = async (req, res, next) => {
  try {
    const noteId = req.params.id || req.params.shareId;
    const isShareId = req.params.shareId !== undefined;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        error: 'Note ID or Share ID is required',
      });
    }

    // Find note by ID or shareId
    let note;
    if (isShareId) {
      note = await Note.findByShareId(noteId);
    } else {
      note = await Note.findById(noteId);
    }

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }

    // Check if note is expired
    if (note.isExpired()) {
      return res.status(410).json({
        success: false,
        error: 'Note has expired',
      });
    }

    // Public notes can be viewed by anyone
    if (note.isPublic) {
      req.note = note;
      req.canEdit = false;
      return next();
    }

    // Private notes require authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'This note is private',
      });
    }

    // Check if user is the owner
    if (note.owner && note.owner.toString() === req.user._id.toString()) {
      req.note = note;
      req.canEdit = true;
      return next();
    }

    // User is authenticated but not the owner
    return res.status(403).json({
      success: false,
      error: 'Permission denied',
      message: 'You do not have permission to view this note',
    });
  } catch (error) {
    console.error('Note view permission error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify view permission',
      message: error.message,
    });
  }
};

/**
 * Combined middleware: First try optional auth, then verify edit permission
 * Use this for routes that need to support both authenticated and guest users
 */
export const noteEditAuth = [optionalAuth, verifyNoteEditPermission];

/**
 * Combined middleware: First try optional auth, then verify view permission
 * Use this for routes that need to support both public and private notes
 */
export const noteViewAuth = [optionalAuth, verifyNoteViewPermission];

export default {
  verifyNoteEditPermission,
  verifyNoteViewPermission,
  noteEditAuth,
  noteViewAuth,
};
