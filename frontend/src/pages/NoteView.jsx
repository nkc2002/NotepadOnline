import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { noteService } from '../services/noteService';
import Loading from '../components/Loading';

function NoteView() {
  const { id, shareId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [hasEditToken, setHasEditToken] = useState(false);
  const [showEditTokenPrompt, setShowEditTokenPrompt] = useState(false);
  const [inputEditToken, setInputEditToken] = useState('');

  useEffect(() => {
    loadNote();
  }, [id, shareId]);

  const loadNote = async () => {
    setLoading(true);
    setError('');

    try {
      let response;

      if (shareId) {
        // Load via share link (public read-only)
        response = await noteService.getNoteByShareId(shareId);
      } else {
        // Load by ID
        response = await noteService.getNoteById(id);
      }

      if (response.success) {
        const noteData = response.data.note;
        setNote(noteData);
        setCanEdit(response.data.canEdit || false);

        // Check if we have edit token for guest note
        if (!isAuthenticated && noteData.isGuest) {
          const token = localStorage.getItem(`editToken_${noteData.id}`);
          setHasEditToken(Boolean(token));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (note?.shareId) {
      const shareUrl = `${window.location.origin}/share/${note.shareId}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  const handleEdit = () => {
    if (!isAuthenticated && note?.isGuest && !hasEditToken) {
      // Prompt for edit token
      setShowEditTokenPrompt(true);
    } else {
      navigate(`/editor/${note.id}`);
    }
  };

  const handleEditTokenSubmit = () => {
    if (inputEditToken.trim()) {
      // Save token to localStorage
      localStorage.setItem(`editToken_${note.id}`, inputEditToken.trim());
      setHasEditToken(true);
      setShowEditTokenPrompt(false);
      navigate(`/editor/${note.id}`);
    } else {
      alert('Please enter a valid edit token');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const token = !isAuthenticated ? localStorage.getItem(`editToken_${note.id}`) : null;
      await noteService.deleteNote(note.id, token);

      alert('Note deleted successfully!');

      // Clear edit token from localStorage
      if (token) {
        localStorage.removeItem(`editToken_${note.id}`);
      }

      navigate(isAuthenticated ? '/dashboard' : '/');
    } catch (err) {
      alert(err.message || 'Failed to delete note');
    }
  };

  if (loading) {
    return <Loading message="Loading note..." />;
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="error-page">
        <h2>Note not found</h2>
        <p>This note may have been deleted or expired.</p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="note-view-page">
      <div className="note-header">
        <h1>{note.title}</h1>
        <div className="note-meta">
          <span className={`note-badge ${note.isPublic ? 'public' : 'private'}`}>
            {note.isPublic ? '🌐 Public' : '🔒 Private'}
          </span>
          {note.isGuest && <span className="note-badge guest">👤 Guest Note</span>}
          <span className="note-views">👁️ {note.views || 0} views</span>
          <span className="note-date">
            📅 Updated: {new Date(note.updatedAt).toLocaleDateString()}
          </span>
          {note.expiresAt && (
            <span className="note-expires">
              ⏰ Expires: {new Date(note.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Guest note warning */}
      {note.isGuest && !hasEditToken && !isAuthenticated && (
        <div className="warning-banner">
          <p>
            ⚠️ <strong>Guest Note:</strong> You need the edit token to modify this note. If you
            created this note, enter your edit token to edit or delete it.
          </p>
        </div>
      )}

      {/* Share link read-only notice */}
      {shareId && (
        <div className="info-banner">
          <p>ℹ️ You are viewing this note via a share link (read-only mode).</p>
        </div>
      )}

      <div className="note-content-wrapper">
        <div className="note-content" style={{ whiteSpace: 'pre-wrap' }}>
          {note.content}
        </div>
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          <h3>Tags:</h3>
          <div className="tags-list">
            {note.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="note-actions">
        {/* Show edit/delete for owners or guests with token */}
        {(canEdit || (note.isGuest && hasEditToken)) && (
          <>
            <button onClick={handleEdit} className="btn btn-primary">
              ✏️ Edit Note
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              🗑️ Delete Note
            </button>
          </>
        )}

        {/* Show "Enter Edit Token" for guest notes when user doesn't have token */}
        {note.isGuest && !hasEditToken && !isAuthenticated && (
          <button onClick={() => setShowEditTokenPrompt(true)} className="btn btn-secondary">
            🔑 Enter Edit Token
          </button>
        )}

        {note.isPublic && note.shareId && (
          <button onClick={handleShare} className="btn btn-secondary">
            📤 Share Note
          </button>
        )}

        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          ← Back
        </button>
      </div>

      {/* Edit Token Prompt Modal */}
      {showEditTokenPrompt && (
        <div className="modal-overlay" onClick={() => setShowEditTokenPrompt(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🔑 Enter Edit Token</h2>
            <p>To edit or delete this guest note, please enter your edit token:</p>

            <div className="form-group">
              <input
                type="text"
                value={inputEditToken}
                onChange={(e) => setInputEditToken(e.target.value)}
                placeholder="Paste your edit token here"
                className="token-input"
              />
            </div>

            <div className="modal-actions">
              <button onClick={handleEditTokenSubmit} className="btn btn-primary">
                Submit
              </button>
              <button onClick={() => setShowEditTokenPrompt(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>

            <p className="help-text">💡 The edit token was provided when you created this note.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteView;
