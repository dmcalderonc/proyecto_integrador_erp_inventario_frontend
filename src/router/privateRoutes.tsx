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
import ProyectosPage from '../pages/private/ProyectosPage';
import RequirementsPage from '../pages/private/RequirementsPage';
import type { JSX } from 'react/jsx-runtime';
import DespachosPage from '../pages/private/DespachosPage';
import ProfilePage from '../pages/private/ProfilePage';
import TraspasosPage from '../pages/private/TraspasosPage';
import { PERMISSIONS } from '../lib/permissions';

interface PrivateRoute {
  path: string;
  element: JSX.Element;
  allowedRoles?: UserRole[];
}

export const privateRoutes: PrivateRoute[] = [
  { path: '/dashboard', element: <DashboardPage />, allowedRoles: PERMISSIONS.CAN_ACCESS_DASHBOARD },
  { path: '/profile', element: <ProfilePage />, allowedRoles: PERMISSIONS.CAN_ACCESS_DASHBOARD },
  { path: '/users', element: <UsersPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_USERS },
  { path: '/proveedores', element: <ProveedoresPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_PROVEEDORES },
  { path: '/categorias', element: <CategoriasPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_CATEGORIAS },
  { path: '/unidades-medida', element: <UnidadesMedidaPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_UNIDADES },
  { path: '/bodegas', element: <BodegasPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_BODEGAS },
  { path: '/materiales', element: <MaterialesPage />, allowedRoles: PERMISSIONS.CAN_VIEW_MATERIALES },
  { path: '/requirements', element: <RequirementsPage />, allowedRoles: PERMISSIONS.CAN_VIEW_REQUIREMENTS },
  { path: '/compras', element: <ComprasPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_COMPRAS },
  { path: '/movimientos', element: <MovimientosPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_MOVIMIENTOS },
  { path: '/ajustes-inventario', element: <AjustesPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_AJUSTES },
  { path: '/cotizaciones', element: <CotizacionesPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_COTIZACIONES },
  { path: '/solicitudes', element: <SolicitudesPage />, allowedRoles: PERMISSIONS.CAN_VIEW_SOLICITUDES },
  { path: '/proyectos', element: <ProyectosPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_PROYECTOS },
  { path: '/despachos', element: <DespachosPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_DESPACHOS },
  { path: '/traspasos', element: <TraspasosPage />, allowedRoles: PERMISSIONS.CAN_MANAGE_TRASPASOS },
];