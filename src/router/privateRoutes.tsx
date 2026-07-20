import { Navigate } from 'react-router-dom';
import type { UserRole } from '../types';
import UsersPage from '../pages/private/UsersPage';
import ProveedoresPage from '../pages/private/ProveedoresPage';
import CategoriasPage from '../pages/private/CategoriasPage';
import BodegasPage from '../pages/private/BodegasPage';
import ComprasPage from '../pages/private/ComprasPage';
import MovimientosPage from '../pages/private/MovimientosPage';
import AjustesPage from '../pages/private/AjustesPage';
import CotizacionesPage from '../pages/cotizaciones/CotizacionesPage';
import SolicitudesPage from '../pages/solicitudes/SolicitudesPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import MaterialesPage from '../pages/materiales/MaterialesPage';
import InventarioPage from '../pages/inventario/InventarioPage';
import ProyectosPage from '../pages/proyectos/ProyectosPage';
import RequirementsPage from '../pages/requirements/RequirementsPage';
import type { JSX } from 'react/jsx-runtime';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    <p className="text-gray-500 mt-2 font-medium">Página en desarrollo 🚀</p>
  </div>
);

interface PrivateRoute {
  path: string;
  element: JSX.Element;
  allowedRoles?: UserRole[];
}

export const privateRoutes: PrivateRoute[] = [
  { path: '/dashboard', element: <DashboardPage />, allowedRoles: [] },
  { path: '/users', element: <UsersPage />, allowedRoles: ['ADMIN'] },
  { path: '/proveedores', element: <ProveedoresPage />, allowedRoles: ['ADMIN', 'COMPRADOR'] },
  { path: '/categorias', element: <CategoriasPage />, allowedRoles: ['ADMIN'] },
  { path: '/bodegas', element: <BodegasPage />, allowedRoles: ['ADMIN', 'BODEGUERO'] },


  { path: '/materiales', element: <MaterialesPage />, allowedRoles: ['ADMIN', 'BODEGUERO', 'COMPRADOR'] },
  { path: '/inventario', element: <InventarioPage />, allowedRoles: ['ADMIN', 'BODEGUERO'] },


  { path: '/requirements', element: <RequirementsPage />, allowedRoles: ['ADMIN', 'SOLICITANTE', 'BODEGUERO'] },
  { path: '/compras', element: <ComprasPage />, allowedRoles: ['ADMIN', 'BODEGUERO'] },
  { path: '/movimientos', element: <MovimientosPage />, allowedRoles: ['ADMIN', 'BODEGUERO'] },
  { path: '/ajustes-inventario', element: <AjustesPage />, allowedRoles: ['ADMIN', 'BODEGUERO'] },
  { path: '/cotizaciones', element: <CotizacionesPage />, allowedRoles: ['ADMIN', 'COMPRADOR'] },
  { path: '/solicitudes', element: <SolicitudesPage />, allowedRoles: ['ADMIN', 'BODEGUERO', 'COMPRADOR', 'SOLICITANTE'] },
  { path: '/proyectos', element: <ProyectosPage />, allowedRoles: ['ADMIN', 'SOLICITANTE'] },
  { path: '/despachos', element: <PlaceholderPage title="Despachos" />, allowedRoles: ['ADMIN', 'BODEGUERO'] },

  { path: '/', element: <Navigate to="/dashboard" replace /> },
];