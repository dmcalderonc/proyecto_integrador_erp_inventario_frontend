import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './guards/ProtectedRoute'
import { Login } from './pages/login/login'
import UsersPage from './pages/users/UsersPage'
import ProveedoresPage from './pages/proveedores/ProveedoresPage'
import CategoriasPage from './pages/categorias/CategoriasPage'
import BodegasPage from './pages/bodegas/BodegasPage'


const navLinks = [
  { to: '/users', label: 'Usuarios' },
  { to: '/proveedores', label: 'Proveedores' },
  { to: '/categorias', label: 'Categorías' },
  { to: '/bodegas', label: 'Bodegas' },
]

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-6">
          <span className="font-bold text-lg text-blue-600">ERP Inventario</span>
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
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        {/* Rutas envueltas en el Layout para que tengan el menú superior */}
        <Route path="/users" element={<Layout><UsersPage /></Layout>} />
        <Route path="/proveedores" element={<Layout><ProveedoresPage /></Layout>} />
        <Route path="/categorias" element={<Layout><CategoriasPage /></Layout>} />
        <Route path="/bodegas" element={<Layout><BodegasPage /></Layout>} />
        
       
        <Route path="/" element={<Navigate to="/users" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
