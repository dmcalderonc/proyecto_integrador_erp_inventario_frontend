import type { UserRole } from '../types';
import UsersPage from '../pages/private/UsersPage';
import ProveedoresPage from '../pages/private/ProveedoresPage';
import CategoriasPage from '../pages/private/CategoriasPage';
import BodegasPage from '../pages/private/BodegasPage';
import ComprasPage from '../pages/private/ComprasPage';
import MovimientosPage from '../pages/private/MovimientosPage';
import AjustesPage from '../pages/private/AjustesPage';
import CotizacionesPage from '../pages/private/CotizacionesPage';
import SolicitudesPage from '../pages/private/SolicitudesPage';
import DashboardPage from '../pages/private/DashboardPage';
import MaterialesPage from '../pages/private/MaterialesPage';
import UnidadesMedidaPage from '../pages/private/UnidadesMedidaPage';
import InventarioPage from '../pages/private/InventarioPage';
import ProyectosPage from '../pages/private/ProyectosPage';
import RequirementsPage from '../pages/private/RequirementsPage';
import type { JSX } from 'react/jsx-runtime';
import DespachosPage from '../pages/private/DespachosPage';
import ProfilePage from '../pages/private/ProfilePage';

interface PrivateRoute {
  path: string;
  element: JSX.Element;
  allowedRoles?: UserRole[];
}

export const privateRoutes: PrivateRoute[] = [
  { path: '/dashboard', element: <DashboardPage />, allowedRoles: [] },
  { path: '/profile', element: <ProfilePage />, allowedRoles: [] },
  { path: '/users', element: <UsersPage />, allowedRoles: ['ADMIN'] },
  { path: '/proveedores', element: <ProveedoresPage />, allowedRoles: ['ADMIN', 'COMPRADOR'] },
  { path: '/categorias', element: <CategoriasPage />, allowedRoles: ['ADMIN'] },
  { path: '/unidades-medida', element: <UnidadesMedidaPage />, allowedRoles: ['ADMIN'] },
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
  { path: '/despachos', element: <DespachosPage />, allowedRoles: ['ADMIN', 'BODEGUERO'] },
];