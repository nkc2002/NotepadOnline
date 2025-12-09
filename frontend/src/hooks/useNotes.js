import { useState, useEffect } from 'react';
import { noteService } from '../services/noteService';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotes = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await noteService.getUserNotes(page, limit, search);
      setNotes(response.data.notes);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to load notes');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData) => {
    try {
      const response = await noteService.createNote(noteData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateNote = async (id, noteData, editToken = null) => {
    try {
      const response = await noteService.updateNote(id, noteData, editToken);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteNote = async (id, editToken = null) => {
    try {
      await noteService.deleteNote(id, editToken);
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    loadNotes,
    createNote,
    updateNote,
    deleteNote
  };
}

export default useNotes;

