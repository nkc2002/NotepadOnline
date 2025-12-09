import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>📝 Notepad Online</h1>
          </Link>

          <nav className="nav">
            {/* Left navigation - Main links */}
            <div className="nav-main">
              <Link to="/" className={isActive('/') ? 'nav-link active' : 'nav-link'}>
                Home
              </Link>
              <Link to="/public" className={isActive('/public') ? 'nav-link active' : 'nav-link'}>
                Public Notes
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className={isActive('/dashboard') ? 'nav-link active' : 'nav-link'}
                >
                  My Notes
                </Link>
              )}
            </div>

            {/* Right navigation - Auth links */}
            <div className="nav-auth">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="nav-link user-link">
                    <span className="user-avatar">👤</span>
                    <span className="user-name">{user?.name || user?.email?.split('@')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline btn-small">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-small">
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
