import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { noteService } from '../services/noteService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function PublicNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadPublicNotes();
  }, [page]);

  const loadPublicNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await noteService.getPublicNotes(page, 12);
      if (response.success) {
        setNotes(response.data.notes);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError('Failed to load public notes');
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
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

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <Loading message="Loading public notes..." />;
  }

  return (
    <div className="public-notes-page">
      <div className="page-header">
        <h1>📚 Public Notes</h1>
        <p>Browse notes shared by the community</p>
        <Link to="/editor" className="btn btn-primary">
          + Create Your Note
        </Link>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {notes.length === 0 ? (
        <div className="empty-state">
          <p>No public notes yet. Be the first to create one!</p>
          <Link to="/editor" className="btn btn-primary">
            Create First Note
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
                  <span className="note-date">📅 {formatDate(note.createdAt)}</span>
                  {note.isGuest && <span className="guest-badge">Guest</span>}
                  <span className="note-views">👁 {note.views}</span>
                </div>
                <div className="note-actions">
                  <Link to={`/share/${note.shareId}`} className="btn btn-small">
                    View Note
                  </Link>
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
                Page {page} of {pagination.pages}
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

export default PublicNotes;
