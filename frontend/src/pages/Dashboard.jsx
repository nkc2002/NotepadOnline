import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { noteService } from '../services/noteService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await noteService.getUserNotes(page, 12, searchQuery);
      if (response.success) {
        setNotes(response.data.notes);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notes');
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await noteService.deleteNote(noteId);
      // Reload notes after deletion
      loadNotes();
    } catch (err) {
      alert(err.message || 'Failed to delete note');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading && notes.length === 0) {
    return <Loading message="Loading your notes..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📂 My Notes</h1>
        <Link to="/editor" className="btn btn-primary">
          + Create New Note
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {notes.length === 0 ? (
        <div className="empty-state">
          <p>
            {searchQuery
              ? 'No notes found matching your search.'
              : 'No notes yet. Create your first note!'}
          </p>
          <Link to="/editor" className="btn btn-primary">
            Create Note
          </Link>
        </div>
      ) : (
        <>
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <h3>{note.title}</h3>
                <p className="note-preview">{truncateContent(note.content)}</p>
                <div className="note-meta">
                  <span className="note-date">📅 {formatDate(note.updatedAt)}</span>
                  <span className={`note-status ${note.isPublic ? 'public' : 'private'}`}>
                    {note.isPublic ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
                <div className="note-actions">
                  <Link to={`/editor/${note.id}`} className="btn btn-small">
                    ✏️ Edit
                  </Link>
                  <Link to={`/note/${note.id}`} className="btn btn-small">
                    👁 View
                  </Link>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="btn btn-small btn-danger"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-small"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {page} of {pagination.pages} ({pagination.total} notes)
              </span>
              <button
                className="btn btn-small"
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
