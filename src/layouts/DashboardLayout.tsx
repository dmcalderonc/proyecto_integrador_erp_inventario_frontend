import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/users', label: 'Usuarios' },
  { to: '/proveedores', label: 'Proveedores' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/bodegas', label: 'Bodegas' },
];

export function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-lg text-blue-600">ERP Inventario</Link>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-blue-600 border-b-2 border-blue-600 h-14 flex items-center'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.nombre}</span>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">
              Salir
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
