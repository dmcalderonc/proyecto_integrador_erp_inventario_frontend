import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../guards/ProtectedRoute';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { publicRoutes } from './publicRoutes';
import { privateRoutes } from './privateRoutes';
import { DashboardLayout } from '../layouts/DashboardLayout';

export function AppRouter() {
  return (
    <Routes>
      {publicRoutes.map(route => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {privateRoutes.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={<ProtectedRoute allowedRoles={route.allowedRoles} />}
            >
              <Route index element={route.element} />
            </Route>
          ))}
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
