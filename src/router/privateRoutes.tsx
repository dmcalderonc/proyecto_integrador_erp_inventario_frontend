import { Navigate } from 'react-router-dom';
import UsersPage from '../pages/private/UsersPage';
import ProveedoresPage from '../pages/private/ProveedoresPage';
import CategoriasPage from '../pages/private/CategoriasPage';
import BodegasPage from '../pages/private/BodegasPage';
import ComprasPage from '../pages/private/ComprasPage';
import MovimientosPage from '../pages/private/MovimientosPage';
import AjustesPage from '../pages/private/AjustesPage';
import DashboardPage from '../pages/dashboard/DashboardPage';

// Importaciones actualizadas para los nuevos módulos:
import MaterialesPage from '../pages/materiales/MaterialesPage';
import InventarioPage from '../pages/inventario/InventarioPage';

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

  // Módulos Completados:
  { path: '/materiales', element: <MaterialesPage /> },
  { path: '/inventario', element: <InventarioPage /> },

  // Placeholders restantes:
  { path: '/requirements', element: <PlaceholderPage title="Requerimientos" /> },
  { path: '/compras', element: <ComprasPage /> },
  { path: '/movimientos', element: <MovimientosPage /> },
  { path: '/ajustes-inventario', element: <AjustesPage /> },
  { path: '/proyectos', element: <PlaceholderPage title="Proyectos" /> },

  { path: '/', element: <Navigate to="/dashboard" replace /> },
];