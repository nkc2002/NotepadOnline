import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>📝 Notepad Online</h1>
        <p>Create, share, and manage your notes online</p>

        <div className="cta-buttons">
          <Link to="/editor" className="btn btn-primary btn-large">
            ✨ Create Note
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-secondary">
                My Notes
              </Link>
              <Link to="/public" className="btn btn-outline">
                Public Notes
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-secondary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
            </>
          )}
        </div>

        <p className="guest-info">
          {isAuthenticated
            ? '🔐 Create private notes that only you can see, or share them publicly!'
            : '✨ You can create notes without registering - they will be public and visible to everyone!'}
        </p>
      </div>

      <div className="features-section">
        <div className="feature">
          <h3>🚀 Quick Notes</h3>
          <p>Create notes instantly - no registration required for public notes</p>
        </div>
        <div className="feature">
          <h3>🔗 Share Easily</h3>
          <p>Share your public notes with a simple link</p>
        </div>
        <div className="feature">
          <h3>🔒 Private & Secure</h3>
          <p>Register to create private notes that only you can access</p>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="home-cta-section">
          <h2>Ready to get started?</h2>
          <p>Create an account to save private notes and manage all your content in one place.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">
              Create Free Account
            </Link>
            <Link to="/public" className="btn btn-secondary">
              Browse Public Notes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
