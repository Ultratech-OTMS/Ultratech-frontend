import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Generic protected route
export const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'transport') return <Navigate to="/transport" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public only (redirect logged in users)
export const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'transport') return <Navigate to="/transport" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};