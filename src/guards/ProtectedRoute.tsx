import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AccessDeniedPage } from '../pages/private/AccessDeniedPage';

interface Props {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.rol)) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
};