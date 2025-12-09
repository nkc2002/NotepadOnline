import Note from '../models/Note.js';
import { validateNote } from '../utils/validation.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * Get all notes for authenticated user
 * GET /api/notes
 */
export const getUserNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = { owner: req.user._id };
    
    // Add search if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v');

    const total = await Note.countDocuments(query);

    return successResponse(res, {
      notes: notes.map(note => note.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Notes retrieved successfully');
  } catch (error) {
    console.error('Get notes error:', error);
    return errorResponse(res, 'Failed to retrieve notes', 500);
  }
};

/**
 * Get single note by ID
 * GET /api/notes/:id
 */
export const getNoteById = async (req, res) => {
  try {
    // Increment view count
    await req.note.incrementViews();

    return successResponse(res, { 
      note: req.note.toPublicJSON(),
      canEdit: req.canEdit || false
    }, 'Note retrieved successfully');
  } catch (error) {
    console.error('Get note error:', error);
    return errorResponse(res, 'Failed to retrieve note', 500);
  }
};

/**
 * Get note by shareId (public read-only)
 * GET /api/notes/share/:shareId
 */
export const getNoteByShareId = async (req, res) => {
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return errorResponse(res, 'Share ID is required', 400);
    }

    // Find note by shareId
    const note = await Note.findByShareId(shareId);

    if (!note) {
      return errorResponse(res, 'Note not found', 404);
    }

    // Check if note is expired
    if (note.isExpired()) {
      return errorResponse(res, 'Note has expired', 410);
    }

    // Only public notes can be accessed via shareId
    if (!note.isPublic) {
      return errorResponse(res, 'This note is private', 403);
    }

    // Increment view count
    await note.incrementViews();

    return successResponse(res, { 
      note: note.toPublicJSON(),
      canEdit: false // Share links are read-only
    }, 'Note retrieved successfully');
  } catch (error) {
    console.error('Get note by shareId error:', error);
    return errorResponse(res, 'Failed to retrieve note', 500);
  }
};

/**
 * Create new note
 * POST /api/notes
 * - Guest can only create public notes
 * - User can create private or public notes
 * - Automatically generates shareId
 */
export const createNote = async (req, res) => {
  try {
    const { title, content, isPublic, tags = [], expireAt } = req.body;

    // Validate input
    const validation = validateNote({ title, content });
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    // Guest users can ONLY create public notes
    let noteIsPublic = isPublic;
    if (!req.user) {
      noteIsPublic = true; // Force public for guests
    }

    // Create note
    const note = new Note({
      title,
      content,
      isPublic: noteIsPublic,
      tags,
      owner: req.user ? req.user._id : null, // null for guest notes
      expireAt: expireAt ? new Date(expireAt) : undefined
    });

    await note.save();

    // For guest notes, include editToken in response
    const includeEditToken = !req.user;

    const responseData = {
      note: note.toPublicJSON(includeEditToken)
    };

    // Add warning for guests if they tried to create private note
    if (!req.user && isPublic === false) {
      responseData.warning = 'Guest users can only create public notes. Your note has been created as public.';
    }

    return successResponse(res, responseData, 'Note created successfully', 201);
  } catch (error) {
    console.error('Create note error:', error);
    
    if (error.message.includes('shareId')) {
      return errorResponse(res, 'Failed to generate unique share ID', 500);
    }

    return errorResponse(res, 'Failed to create note', 500);
  }
};

/**
 * Update note
 * PUT /api/notes/:id
 * - User must be owner (JWT)
 * - Guest must have valid editToken
 */
export const updateNote = async (req, res) => {
  try {
    const { title, content, isPublic, tags } = req.body;

    // Guest cannot change note to private
    if (req.isGuest && isPublic === false) {
      return errorResponse(res, 'Guest notes must remain public', 403);
    }

    // Validate input if title or content is provided
    if (title !== undefined || content !== undefined) {
      const validation = validateNote({ 
        title: title || req.note.title, 
        content: content || req.note.content 
      });
      if (!validation.isValid) {
        return errorResponse(res, 'Validation failed', 400, validation.errors);
      }
    }

    // Update fields
    if (title !== undefined) req.note.title = title;
    if (content !== undefined) req.note.content = content;
    if (isPublic !== undefined && req.isOwner) {
      // Only authenticated owners can change privacy
      req.note.isPublic = isPublic;
    }
    if (tags !== undefined) req.note.tags = tags;

    await req.note.save();

    return successResponse(res, { 
      note: req.note.toPublicJSON() 
    }, 'Note updated successfully');
  } catch (error) {
    console.error('Update note error:', error);
    return errorResponse(res, 'Failed to update note', 500);
  }
};

/**
 * Delete note
 * DELETE /api/notes/:id
 * - User must be owner (JWT)
 * - Guest must have valid editToken
 */
export const deleteNote = async (req, res) => {
  try {
    const noteId = req.note._id;
    await req.note.deleteOne();

    return successResponse(res, { 
      id: noteId 
    }, 'Note deleted successfully');
  } catch (error) {
    console.error('Delete note error:', error);
    return errorResponse(res, 'Failed to delete note', 500);
  }
};

/**
 * Get public notes list
 * GET /api/notes/public/list
 */
export const getPublicNotes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const notes = await Note.findPublicNotes({
      page: parseInt(page),
      limit: parseInt(limit)
    });

    const total = await Note.countDocuments({ 
      isPublic: true,
      $or: [
        { expireAt: null },
        { expireAt: { $gt: new Date() } }
      ]
    });

    return successResponse(res, {
      notes: notes.map(note => note.toPublicJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Public notes retrieved successfully');
  } catch (error) {
    console.error('Get public notes error:', error);
    return errorResponse(res, 'Failed to retrieve public notes', 500);
  }
};

export default {
  getUserNotes,
  getNoteById,
  getNoteByShareId,
  createNote,
  updateNote,
  deleteNote,
  getPublicNotes
};

