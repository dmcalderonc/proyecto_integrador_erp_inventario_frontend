import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import {
  LayoutDashboard, Users, Box, Tags, Truck, Package,
  ClipboardList, ShoppingCart, SlidersHorizontal, FolderOpen,
  FileText, ClipboardCheck, PackageCheck, Activity, LogOut,
  Menu, X, BellRing, Shield
} from 'lucide-react';
import type { UserRole } from '../types';
import { socket } from '../lib/socket';
import toast from 'react-hot-toast';

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
  { to: '/unidades-medida', label: 'Unidades', icon: Tags, roles: ['ADMIN'] },
  { to: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['ADMIN', 'COMPRADOR'] },
  { to: '/materiales', label: 'Materiales', icon: Package, roles: ['ADMIN', 'BODEGUERO', 'COMPRADOR'] },
  { to: '/inventario', label: 'Inventario', icon: Box, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/requirements', label: 'Requerimientos', icon: ClipboardList, roles: ['ADMIN', 'SOLICITANTE', 'BODEGUERO', 'COMPRADOR'] },
  { to: '/compras', label: 'Compras', icon: ShoppingCart, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/movimientos', label: 'Movimientos', icon: Activity, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/solicitudes', label: 'Solicitudes', icon: ClipboardCheck, roles: ['ADMIN', 'BODEGUERO', 'COMPRADOR', 'SOLICITANTE'] },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: FileText, roles: ['ADMIN', 'COMPRADOR'] },
  { to: '/ajustes-inventario', label: 'Ajustes', icon: SlidersHorizontal, roles: ['ADMIN', 'BODEGUERO'] },
  { to: '/proyectos', label: 'Proyectos', icon: FolderOpen, roles: ['ADMIN', 'SOLICITANTE'] },
  { to: '/despachos', label: 'Despachos', icon: PackageCheck, roles: ['ADMIN', 'BODEGUERO'] },
];

const roleColors: Record<string, string> = {
  ADMIN: 'text-purple-400',
  BODEGUERO: 'text-info',
  COMPRADOR: 'text-warning',
  SOLICITANTE: 'text-success',
};

export function DashboardLayout() {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredLinks = navLinks.filter(link => hasRole(link.roles));

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit('join_role_room', user.rol);

      socket.on('ticket_liberado', (data: { reqId: string | number; material: string }) => {
        if (user.rol === 'ADMIN' || user.rol === 'BODEGUERO') {
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-overlay border border-border-subtle shadow-2xl rounded-2xl pointer-events-auto flex`}>
              <div className="flex-1 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-info-bg flex items-center justify-center border border-info/20 shrink-0">
                    <BellRing className="h-5 w-5 text-info animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary">Stock Liberado (REQ-{data.reqId})</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Material: <span className="font-semibold text-success">{data.material}</span>. Listo para despacho.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="border-l border-border-subtle px-4 text-text-muted hover:text-text-primary hover:bg-elevated transition-colors rounded-r-2xl cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ), { duration: 8000, position: 'top-right' });
        }
      });
    }

    return () => {
      socket.off('ticket_liberado');
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-base text-text-secondary flex flex-col">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-surface border-b border-border-subtle z-30 flex items-center px-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-text-secondary hover:bg-elevated cursor-pointer">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/dashboard" className="ml-3 font-bold text-lg text-text-primary">StockLy</Link>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-surface border-r border-border-subtle flex flex-col z-40 transition-transform duration-200 ease-in-out",
        "md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border-subtle shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Package size={18} className="text-accent" />
            </div>
            <span className="font-bold text-lg text-text-primary">StockLy</span>
          </Link>
        </div>

        {/* User card */}
        <div className="p-3 border-b border-border-subtle shrink-0">
          <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-elevated transition-colors group">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
              {(user?.nombre || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">{user?.nombre || 'Usuario'}</p>
              <p className={`text-xs font-medium ${roleColors[user?.rol || ''] || 'text-text-muted'}`}>{user?.rol}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-elevated hover:text-text-primary"
                )}
              >
                <Icon size={18} className={isActive ? "text-accent" : "text-text-muted"} />
                {link.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border-subtle shrink-0">
          <button
            onClick={() => { logout(); window.location.replace('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-danger hover:bg-danger-bg transition-colors cursor-pointer"
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
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
