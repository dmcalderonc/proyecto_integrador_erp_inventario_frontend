import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Usuarios',
  bodegas: 'Bodegas',
  categorias: 'Categorías',
  'unidades-medida': 'Unidades de Medida',
  proveedores: 'Proveedores',
  materiales: 'Materiales',
  inventario: 'Inventario',
  requirements: 'Requerimientos',
  compras: 'Compras',
  movimientos: 'Movimientos',
  'ajustes-inventario': 'Ajustes de Inventario',
  cotizaciones: 'Cotizaciones',
  solicitudes: 'Solicitudes',
  proyectos: 'Proyectos',
  despachos: 'Despachos',
  profile: 'Mi Perfil',
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length <= 1 && segments[0] === 'dashboard') return null;

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const name = routeNames[seg] || seg;
    const isLast = i === segments.length - 1;
    return { path, name, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4">
      <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
        <Home size={14} />
      </Link>
      {crumbs.map(crumb => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight size={12} className="text-gray-300" />
          {crumb.isLast ? (
            <span className="font-medium text-gray-700">{crumb.name}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-blue-600 transition-colors">
              {crumb.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
