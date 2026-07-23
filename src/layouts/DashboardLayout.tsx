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

function SidebarContent({ user, filteredLinks, location, logout }: {
  user: ReturnType<typeof useAuth>['user'];
  filteredLinks: NavItem[];
  location: ReturnType<typeof useLocation>;
  logout: () => void;
}) {
  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2.5" style={{ fontFamily: "var(--font-heading)" }}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30 overflow-hidden">
            <img src="/favicon.png" alt="Stockly" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">stockly</span>
        </Link>
      </div>

      <div className="p-4 border-b border-border shrink-0">
        <Link to="/profile" className="block hover:bg-white/5 rounded-xl p-2 transition-colors border border-transparent hover:border-border">
          <p className="text-sm font-bold text-card-foreground truncate">{user?.nombre || 'Usuario'}</p>
          <p className="text-xs text-primary font-semibold">{user?.rol}</p>
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
                  ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20 border border-accent"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} className={isActive ? "text-accent-foreground" : "text-muted-foreground"} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <button
          onClick={() => { logout(); window.location.replace('/'); }}
          className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </>
  );
}

export function DashboardLayout() {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredLinks = navLinks.filter(link => hasRole(link.roles));

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-card border-b border-border z-50 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:bg-white/10"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <Link to="/dashboard" className="ml-3 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center overflow-hidden">
            <img src="/favicon.png" alt="Stockly" className="w-4 h-4 object-contain" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">stockly</span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-2xl flex flex-col z-50 transition-transform duration-200 ease-in-out md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent user={user} filteredLinks={filteredLinks} location={location} logout={logout} />
      </aside>

      {/* Desktop layout: grid sidebar + content */}
      <div className="hidden md:grid md:grid-cols-[256px_1fr] min-h-screen">
        {/* Desktop sidebar - sticky, no z-index needed */}
        <aside className="sticky top-0 h-screen bg-card border-r border-border flex flex-col overflow-hidden">
          <SidebarContent user={user} filteredLinks={filteredLinks} location={location} logout={logout} />
        </aside>

        {/* Desktop content */}
        <div className="flex flex-col min-w-0">
          <main className="flex-1 py-8 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
              <Breadcrumbs />
              <Outlet />
            </div>
          </main>
          <div className="border-t border-border">
            <Footer />
          </div>
        </div>
      </div>

      {/* Mobile content (no sidebar offset) */}
      <div className="md:hidden pt-14 flex flex-col min-h-screen">
        <main className="flex-1 py-8 px-4 sm:px-6">
          <Breadcrumbs />
          <Outlet />
        </main>
        <div className="border-t border-border">
          <Footer />
        </div>
      </div>
    </div>
  );
}
