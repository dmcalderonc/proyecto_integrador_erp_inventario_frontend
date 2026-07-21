import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Footer } from '../components/ui/Footer';
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
  Activity,
  LogOut,
  Menu,
  X,
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
  { to: '/unidades-medida', label: 'Unidades de Medida', icon: Tags, roles: ['ADMIN'] },
  { to: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['ADMIN', 'COMPRADOR'] },
  { to: '/materiales', label: 'Materiales', icon: Package, roles: ['ADMIN', 'BODEGUERO', 'COMPRADOR'] },
  { to: '/inventario', label: 'Inventario', icon: Box, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/requirements', label: 'Requerimientos', icon: ClipboardList, roles: ['ADMIN', 'SOLICITANTE', 'BODEGUERO'] },
  { to: '/compras', label: 'Compras', icon: ShoppingCart, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/movimientos', label: 'Movimientos', icon: Activity, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/solicitudes', label: 'Solicitudes', icon: ClipboardCheck, roles: ['ADMIN', 'BODEGUERO', 'COMPRADOR', 'SOLICITANTE'] },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: FileText, roles: ['ADMIN', 'COMPRADOR'] },
  { to: '/ajustes-inventario', label: 'Ajustes de Inventario', icon: SlidersHorizontal, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/proyectos', label: 'Proyectos', icon: FolderOpen, roles: ['ADMIN', 'SOLICITANTE'] },
  { to: '/despachos', label: 'Despachos', icon: PackageCheck, roles: ['ADMIN', 'BODEGUERO'] },
];


export function DashboardLayout() {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredLinks = navLinks.filter(link => hasRole(link.roles));

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar - mobile */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b shadow-sm z-30 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/dashboard" className="ml-3 font-bold text-lg text-blue-600">
          StockLy
        </Link>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white border-r shadow-sm flex flex-col z-40 transition-transform duration-200 ease-in-out",
        "md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-14 md:h-16 flex items-center px-6 border-b shrink-0">
          <Link to="/dashboard" className="font-bold text-xl text-blue-600">
            StockLy
          </Link>
        </div>

        <div className="p-4 border-b shrink-0">
          <Link to="/profile" className="block hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.nombre || 'Usuario'}</p>
            <p className="text-xs text-gray-500 font-medium">{user?.rol}</p>
          </Link>
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
            onClick={() => { logout(); window.location.replace('/'); }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64 min-w-0 pt-14 md:pt-0 flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 md:px-8">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>

      <div className="md:ml-64">
        <Footer />
      </div>
    </div>
  );
}
