import { Login } from '../pages/public/LoginPage';
import { LandingPage } from '../pages/public/LandingPage';

export const publicRoutes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <Login /> },
];
