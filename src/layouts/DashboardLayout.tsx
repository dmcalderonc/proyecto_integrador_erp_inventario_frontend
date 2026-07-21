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
    <div className="min-h-screen bg-[#0A1128] text-[#94A3B8] flex flex-col justify-between">
      {/* Top bar - mobile */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-[#111D4A] border-b border-[#334155] z-30 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-[#94A3B8] hover:bg-white/10"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/dashboard" className="ml-3 font-extrabold text-lg text-[#06B6D4]">
          StockLy
        </Link>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-[#111D4A] border-r border-[#334155] shadow-2xl flex flex-col z-40 transition-transform duration-200 ease-in-out",
        "md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-14 md:h-16 flex items-center px-6 border-b border-[#334155] shrink-0">
          <Link to="/dashboard" className="font-extrabold text-xl text-[#06B6D4] tracking-wide">
            StockLy
          </Link>
        </div>

        <div className="p-4 border-b border-[#334155] shrink-0">
          <Link to="/profile" className="block hover:bg-white/5 rounded-xl p-2 transition-colors border border-transparent hover:border-[#334155]">
            <p className="text-sm font-bold text-[#FFFFFF] truncate">{user?.nombre || 'Usuario'}</p>
            <p className="text-xs text-[#10B981] font-semibold">{user?.rol}</p>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#06B6D4] text-white shadow-lg shadow-[#06B6D4]/20 border border-[#06B6D4]"
                    : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-[#94A3B8]"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#334155] shrink-0">
          <button
            onClick={() => { logout(); window.location.replace('/'); }}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64 min-w-0 pt-14 md:pt-0 flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 md:px-8">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>

      <div className="md:ml-64 border-t border-[#334155]">
        <Footer />
      </div>
    </div>
  );
}