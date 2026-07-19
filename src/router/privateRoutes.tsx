import { Navigate } from 'react-router-dom';
import UsersPage from '../pages/private/UsersPage';
import ProveedoresPage from '../pages/private/ProveedoresPage';
import CategoriasPage from '../pages/private/CategoriasPage';
import BodegasPage from '../pages/private/BodegasPage';
import DashboardPage from '../pages/dashboard/DashboardPage';

// Componente helper para las páginas que aún no existen
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    <p className="text-gray-500 mt-2 font-medium">Página en desarrollo 🚀</p>
  </div>
);

export const privateRoutes = [
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/users', element: <UsersPage /> },
  { path: '/proveedores', element: <ProveedoresPage /> },
  { path: '/categorias', element: <CategoriasPage /> },
  { path: '/bodegas', element: <BodegasPage /> },

  // Placeholders para futuros módulos
  { path: '/materiales', element: <PlaceholderPage title="Materiales" /> },
  { path: '/inventario', element: <PlaceholderPage title="Inventario" /> },
  { path: '/requirements', element: <PlaceholderPage title="Requerimientos" /> },
  { path: '/compras', element: <PlaceholderPage title="Compras" /> },
  { path: '/ajustes-inventario', element: <PlaceholderPage title="Ajustes de Inventario" /> },
  { path: '/proyectos', element: <PlaceholderPage title="Proyectos" /> },

  // Redirección principal
  { path: '/', element: <Navigate to="/dashboard" replace /> },
];