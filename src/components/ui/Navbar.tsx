import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border shadow-lg shadow-black/20 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-2.5" style={{ fontFamily: "var(--font-heading)" }}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30 overflow-hidden">
            <img src="/favicon.png" alt="Stockly" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">stockly</span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-sm px-4 py-2 rounded-lg bg-secondary text-white font-medium hover:bg-secondary/80 transition-colors border border-border"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); window.location.replace('/'); }}
                className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Salir
              </button>
            </>
          ) : null}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-white/70 hover:bg-white/5 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border px-6 py-5 flex flex-col gap-3 shadow-xl">
          {isAuthenticated ? (
            <>
              <Link 
                to="/dashboard" 
                onClick={() => setMobileOpen(false)} 
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-secondary border border-border text-center"
              >
                Dashboard
              </Link>
              <button 
                onClick={() => { logout(); window.location.replace('/'); setMobileOpen(false); }} 
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </>
          ) : null}
        </div>
      )}
    </nav>
  );
}
