import { Link } from 'react-router-dom';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Button } from '../../components/ui/Button';
import { Package, BarChart3, Shield, Zap, ArrowRight, Box, Tags, Users, ClipboardList, ShoppingCart, Activity } from 'lucide-react';

const features = [
  { icon: Box, title: 'Control de Inventario', desc: 'Gestión de stock por bodegas con trazabilidad completa.' },
  { icon: ClipboardList, title: 'Requerimientos', desc: 'Flujo de aprobación con splitting inteligente y despacho.' },
  { icon: ShoppingCart, title: 'Compras', desc: 'Órdenes de compra con cotizaciones y recepción de materiales.' },
  { icon: Activity, title: 'Movimientos', desc: 'Ingresos, egresos y transferencias entre bodegas.' },
  { icon: BarChart3, title: 'Dashboard', desc: 'KPIs, gráficas y alertas de stock bajo en tiempo real.' },
  { icon: Shield, title: 'Roles y Permisos', desc: 'Control de acceso por roles: Admin, Bodeguero, Comprador, Solicitante.' },
];

const roles = [
  { name: 'ADMIN', desc: 'Control total del sistema', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { name: 'BODEGUERO', desc: 'Gestión de inventario y movimientos', color: 'text-info bg-info-bg border-info/20' },
  { name: 'COMPRADOR', desc: 'Órdenes de compra y cotizaciones', color: 'text-warning bg-warning-bg border-warning/20' },
  { name: 'SOLICITANTE', desc: 'Creación de requerimientos', color: 'text-success bg-success-bg border-success/20' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-text-secondary flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-8">
            <Zap size={14} />
            Sistema ERP de Inventario
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
            Gestión inteligente de<br />
            <span className="text-accent">inventario y compras</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10">
            Controla tu stock, automatiza compras, gestiona requerimientos y mantén la trazabilidad completa de tus materiales.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                Comenzar ahora <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/materiales">
              <Button variant="secondary" size="lg">
                Ver Catálogo Público
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Todo lo que necesitas</h2>
            <p className="text-text-secondary">Módulos diseñados para gestionar cada aspecto de tu inventario</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-surface border border-border-subtle rounded-2xl p-6 hover:border-border-default transition-all duration-200 group">
                <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 border-t border-border-subtle bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Roles del sistema</h2>
            <p className="text-text-secondary">Acceso controlado según las funciones de cada usuario</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {roles.map((r, i) => (
              <div key={i} className={`p-5 rounded-2xl border text-center ${r.color}`}>
                <Users size={28} className="mx-auto mb-3 opacity-80" />
                <h3 className="font-bold text-base mb-1">{r.name}</h3>
                <p className="text-xs opacity-80">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">¿Listo para empezar?</h2>
          <p className="text-text-secondary mb-8">Crea tu cuenta y comienza a gestionar tu inventario hoy mismo.</p>
          <Link to="/register">
            <Button size="lg" className="gap-2">
              Crear cuenta gratuita <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
