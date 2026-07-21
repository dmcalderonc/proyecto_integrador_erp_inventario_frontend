import { Login } from '../pages/public/LoginPage';
import { LandingPage } from '../pages/public/LandingPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import PublicMaterialesPage from '../pages/public/PublicMaterialesPage';
import PublicMaterialDetailPage from '../pages/public/PublicMaterialDetailPage';

export const publicRoutes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/materiales', element: <PublicMaterialesPage /> },
  { path: '/materiales/:id', element: <PublicMaterialDetailPage /> },
];
