import { Navigate } from 'react-router-dom';
import UsersPage from '../pages/private/UsersPage';
import ProveedoresPage from '../pages/private/ProveedoresPage';
import CategoriasPage from '../pages/private/CategoriasPage';
import BodegasPage from '../pages/private/BodegasPage';

export const privateRoutes = [
  { path: '/users', element: <UsersPage /> },
  { path: '/proveedores', element: <ProveedoresPage /> },
  { path: '/categorias', element: <CategoriasPage /> },
  { path: '/bodegas', element: <BodegasPage /> },
  { path: '/', element: <Navigate to="/users" replace /> },
];
