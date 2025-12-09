import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Layout
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NoteEditor from './pages/NoteEditor';
import NoteView from './pages/NoteView';
import PublicNotes from './pages/PublicNotes';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes with layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public Notes page */}
          <Route path="/public" element={<PublicNotes />} />

          {/* Public note view via share link */}
          <Route path="/share/:shareId" element={<NoteView />} />

          {/* Editor route - accessible by guests for creating new notes */}
          <Route path="/editor" element={<NoteEditor />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Editor route for editing - accessible by guests with editToken */}
          <Route path="/editor/:id" element={<NoteEditor />} />
          <Route
            path="/note/:id"
            element={
              <ProtectedRoute>
                <NoteView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

// 404 Component
function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <a href="/">Go Home</a>
    </div>
  );
}

export default App;
