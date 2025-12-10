import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { noteService } from '../services/noteService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublic: !isAuthenticated, // Guest notes are always public
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editToken, setEditToken] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [savedEditToken, setSavedEditToken] = useState('');
  const [isGuestNote, setIsGuestNote] = useState(false);
  const [showTokenInputModal, setShowTokenInputModal] = useState(false);
  const [inputToken, setInputToken] = useState('');

  useEffect(() => {
    // Load saved edit token for guest editing
    if (!isAuthenticated && id) {
      const token = localStorage.getItem(`editToken_${id}`);
      if (token) {
        setSavedEditToken(token);
      }
    }

    if (isEditMode) {
      loadNote();
    }
  }, [id, isAuthenticated]);

  const loadNote = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await noteService.getNoteById(id);

      if (response.success) {
        const note = response.data.note;
        setFormData({
          title: note.title,
          content: note.content,
          isPublic: note.isPublic,
          tags: note.tags || [],
        });
        setIsGuestNote(note.isGuest || false);

        // If guest note and no saved token, show token input modal
        if (note.isGuest && !isAuthenticated) {
          const token = localStorage.getItem(`editToken_${id}`);
          if (!token) {
            setShowTokenInputModal(true);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isEditMode) {
        // Update existing note
        const token = !isAuthenticated ? savedEditToken : null;
        const response = await noteService.updateNote(id, formData, token);

        if (response.success) {
          alert('Note updated successfully!');
          navigate(`/share/${response.data.note.shareId || id}`, { replace: true });
        }
      } else {
        // Create new note
        const response = await noteService.createNote(formData);

        if (response.success) {
          const note = response.data.note;

          // If guest note, save editToken
          if (!isAuthenticated && note.editToken) {
            setEditToken(note.editToken);
            setShowTokenModal(true);

            // Save to localStorage
            localStorage.setItem(`editToken_${note.id}`, note.editToken);
          } else {
            // Authenticated user, navigate to dashboard
            navigate('/dashboard', { replace: true });
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes?')) {
      navigate(-1);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(editToken);
    alert('Edit token copied to clipboard!');
  };

  const handleCloseTokenModal = () => {
    setShowTokenModal(false);
    navigate('/');
  };

  const handleTokenInputSubmit = () => {
    if (inputToken.trim()) {
      localStorage.setItem(`editToken_${id}`, inputToken.trim());
      setSavedEditToken(inputToken.trim());
      setShowTokenInputModal(false);
    } else {
      alert('Please enter a valid edit token');
    }
  };

  const handleTokenInputCancel = () => {
    setShowTokenInputModal(false);
    navigate(-1);
  };

  if (loading) {
    return <Loading message="Loading note..." />;
  }

  return (
    <div className="note-editor-page">
      <div className="editor-header">
        <h1>{isEditMode ? 'Edit Note' : 'Create New Note'}</h1>
        {!isAuthenticated && !isEditMode && (
          <div className="guest-warning">
            <strong>Guest Mode:</strong> Your note will be public. Save the edit token to edit
            later.
          </div>
        )}
        {!isAuthenticated && isEditMode && isGuestNote && (
          <div className="guest-warning">
            <strong>Editing Guest Note:</strong> Make sure you have saved your edit token.
          </div>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter note title"
            maxLength="200"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="20"
            placeholder="Enter note content"
            style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
          />
        </div>

        {isAuthenticated && (
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              Make this note public (can be shared via link)
            </label>
          </div>
        )}

        {!isAuthenticated && !isEditMode && (
          <div className="guest-note-info">
            <p>
              <strong>Note:</strong> Guest notes are always public and will expire after 7 days.
            </p>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEditMode ? 'Update Note' : 'Create Note'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Edit Token Modal (after creating new note) */}
      {showTokenModal && editToken && (
        <div className="modal-overlay" onClick={handleCloseTokenModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Important: Save Your Edit Token</h2>
            <p>Your note has been created successfully!</p>
            <p>
              <strong>You need this token to edit your note later.</strong>
              Please copy and save it in a safe place.
            </p>

            <div className="edit-token-display">
              <code>{editToken}</code>
            </div>

            <div className="modal-actions">
              <button onClick={handleCopyToken} className="btn btn-primary">
                Copy Token
              </button>
              <button onClick={handleCloseTokenModal} className="btn btn-secondary">
                I've Saved It
              </button>
            </div>

            <p className="warning-text">
              ⚠️ Without this token, you won't be able to edit or delete your note!
            </p>
          </div>
        </div>
      )}

      {/* Token Input Modal (for editing guest notes) */}
      {showTokenInputModal && (
        <div className="modal-overlay" onClick={handleTokenInputCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🔑 Enter Your Edit Token</h2>
            <p>This is a guest note. To edit it, please enter your edit token:</p>

            <div className="form-group">
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Paste your edit token here"
                className="token-input"
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button onClick={handleTokenInputSubmit} className="btn btn-primary">
                Continue Editing
              </button>
              <button onClick={handleTokenInputCancel} className="btn btn-secondary">
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

export default NoteEditor;
