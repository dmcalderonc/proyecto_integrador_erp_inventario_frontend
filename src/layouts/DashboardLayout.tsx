import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  Users,
  Box,
  Tags,
  Truck,
  Package,
  ClipboardList,
  ShoppingCart,
  SlidersHorizontal,
  FolderOpen,
  FileText,
  ClipboardCheck,
  PackageCheck,
  LogOut
} from 'lucide-react';
import type { UserRole } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navLinks: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SOLICITANTE', 'BODEGUERO', 'COMPRADOR'] },
  { to: '/users', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
  { to: '/bodegas', label: 'Bodegas', icon: Box, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/categorias', label: 'Categorías', icon: Tags, roles: ['ADMIN'] },
  { to: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['ADMIN', 'COMPRADOR'] },
  { to: '/materiales', label: 'Materiales', icon: Package, roles: ['ADMIN', 'BODEGUERO', 'COMPRADOR'] },
  { to: '/inventario', label: 'Inventario', icon: Box, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/requirements', label: 'Requerimientos', icon: ClipboardList, roles: ['ADMIN', 'SOLICITANTE', 'BODEGUERO'] },
  { to: '/compras', label: 'Compras', icon: ShoppingCart, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/solicitudes', label: 'Solicitudes', icon: ClipboardCheck, roles: ['ADMIN', 'BODEGUERO', 'COMPRADOR', 'SOLICITANTE'] },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: FileText, roles: ['ADMIN', 'COMPRADOR'] },
  { to: '/ajustes-inventario', label: 'Ajustes de Inventario', icon: SlidersHorizontal, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/proyectos', label: 'Proyectos', icon: FolderOpen, roles: ['ADMIN', 'SOLICITANTE'] },
  { to: '/despachos', label: 'Despachos', icon: PackageCheck, roles: ['ADMIN', 'BODEGUERO'] },
];


export function DashboardLayout() {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const filteredLinks = navLinks.filter(link => hasRole(link.roles));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Fijo */}
      <aside className="w-64 bg-white border-r shadow-sm fixed inset-y-0 left-0 flex flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b shrink-0">
          <Link to="/dashboard" className="font-bold text-xl text-blue-600">
            StockLy
          </Link>
        </div>

        <div className="p-4 border-b shrink-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.nombre || 'Usuario'}</p>
          <p className="text-xs text-gray-500 font-medium">{user?.rol}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon size={18} className={isActive ? "text-blue-700" : "text-gray-500"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t shrink-0">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal con margen izquierdo (ml-64 compensa el width del sidebar) */}
      <main className="flex-1 ml-64 min-w-0">
        <div className="max-w-7xl mx-auto py-6 px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}