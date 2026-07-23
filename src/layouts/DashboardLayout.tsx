import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import {
    LayoutDashboard, Users, Box, Tags, Truck, Package,
    ClipboardList, ShoppingCart, SlidersHorizontal, FolderOpen,
    FileText, ClipboardCheck, PackageCheck, Activity, LogOut,
    Menu, X, Sun, Moon
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
    { to: '/proyectos', label: 'Proyectos', icon: FolderOpen, roles: ['ADMIN', 'SOLICITANTE'] },
    { to: '/bodegas', label: 'Bodegas', icon: Box, roles: ['ADMIN'] },
    { to: '/categorias', label: 'Categorías', icon: Tags, roles: ['ADMIN'] },
    { to: '/unidades-medida', label: 'Unidades', icon: Tags, roles: ['ADMIN'] },
    { to: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['ADMIN', 'COMPRADOR'] },
    { to: '/materiales', label: 'Materiales', icon: Package, roles: ['ADMIN', 'BODEGUERO', 'COMPRADOR'] },
    { to: '/requirements', label: 'Requerimientos', icon: ClipboardList, roles: ['ADMIN', 'SOLICITANTE', 'BODEGUERO', 'COMPRADOR'] },
    { to: '/compras', label: 'Compras', icon: ShoppingCart, roles: ['ADMIN', 'COMPRADOR'] },
    { to: '/cotizaciones', label: 'Cotizaciones', icon: FileText, roles: ['ADMIN', 'COMPRADOR'] },
    { to: '/solicitudes', label: 'Solicitudes', icon: ClipboardCheck, roles: ['ADMIN', 'SOLICITANTE', 'COMPRADOR'] },
    { to: '/movimientos', label: 'Movimientos', icon: Activity, roles: ['ADMIN', 'BODEGUERO'] },
    { to: '/ajustes-inventario', label: 'Ajustes', icon: SlidersHorizontal, roles: ['ADMIN', 'BODEGUERO'] },
    { to: '/despachos', label: 'Despachos', icon: PackageCheck, roles: ['ADMIN', 'BODEGUERO'] },
    { to: '/traspasos', label: 'Traspasos', icon: Truck, roles: ['ADMIN', 'BODEGUERO'] },
];

const roleBadgeColor: Record<string, string> = {
    ADMIN: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    BODEGUERO: 'bg-info/15 text-info border-info/30',
    COMPRADOR: 'bg-warning/15 text-warning border-warning/30',
    SOLICITANTE: 'bg-success/15 text-success border-success/30',
};

export function DashboardLayout() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filteredLinks = navLinks.filter(link => link.roles.includes(user?.rol ?? ''));

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-base text-text-secondary flex flex-col">
            {/* HEADER - desktop */}
            <header className="hidden md:flex fixed top-0 inset-x-0 h-16 bg-surface border-b border-border-subtle z-30 items-center px-6">
                <Link to="/dashboard" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Package size={18} className="text-accent" />
                    </div>
                    <span className="font-bold text-lg text-text-primary">StockLy</span>
                </Link>

                <div className="flex-1" />

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl text-text-secondary hover:bg-elevated hover:text-text-primary transition-colors cursor-pointer"
                        title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <div className="h-6 w-px bg-border-subtle" />

                    <Link to="/profile" className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl hover:bg-elevated transition-colors group">
                        <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                            {(user?.nombre || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors leading-tight">
                                {user?.nombre || 'Usuario'}
                            </p>
                        </div>
                        {user?.rol && (
                            <span className={cn(
                                "text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border leading-tight",
                                roleBadgeColor[user.rol] || 'bg-elevated text-text-muted border-border-default'
                            )}>
                                {user.rol}
                            </span>
                        )}
                    </Link>

                    <button
                        onClick={() => { logout(); window.location.replace('/'); }}
                        className="p-2.5 rounded-xl text-text-muted hover:bg-danger-bg hover:text-danger transition-colors cursor-pointer"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            {/* HEADER - mobile */}
            <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-surface border-b border-border-subtle z-30 flex items-center px-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg text-text-secondary hover:bg-elevated cursor-pointer">
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <Link to="/dashboard" className="ml-3 font-bold text-lg text-text-primary">StockLy</Link>
                <div className="flex-1" />
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-text-secondary hover:bg-elevated cursor-pointer"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                    onClick={() => { logout(); window.location.replace('/'); }}
                    className="p-2 rounded-lg text-text-muted hover:bg-danger-bg hover:text-danger transition-colors cursor-pointer ml-1"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* SIDEBAR */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 bg-surface border-r border-border-subtle flex flex-col z-40 transition-transform duration-200 ease-in-out",
                "md:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
                "md:top-16"
            )}>
                {/* User card */}
                <div className="p-3 border-b border-border-subtle shrink-0 md:hidden">
                    <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-elevated transition-colors group">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
                            {(user?.nombre || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">{user?.nombre || 'Usuario'}</p>
                            <p className={`text-xs font-medium ${roleBadgeColor[user?.rol || ''] || 'text-text-muted'}`}>{user?.rol}</p>
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
            </aside>

            {/* Main content */}
            <main className="md:ml-64 min-w-0 pt-14 md:pt-16 flex-1">
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
