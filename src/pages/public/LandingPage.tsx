import { Link } from 'react-router-dom';

function FloatingShape({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`absolute rounded-full opacity-20 blur-sm animate-pulse ${className}`} style={style} />;
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="relative group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-teal-200 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Main card */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-6 shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-white font-bold text-sm">Panel de Control</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Materiales', value: '1,247', change: '+12%', color: 'bg-teal-500' },
            { label: 'Bodegas', value: '8', change: '+2', color: 'bg-orange-500' },
            { label: 'Movimientos', value: '356', change: '+28%', color: 'bg-purple-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-3 border border-white/10">
              <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`} />
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-teal-300 text-xs">{stat.label}</div>
              <div className="text-green-400 text-xs font-semibold mt-1">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Chart mockup */}
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white text-xs font-semibold">Movimientos por Mes</span>
            <span className="text-teal-300 text-xs">2025</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md ${i === 11 ? 'bg-orange-400' : 'bg-teal-400/60'} transition-all duration-500`}
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
              <span key={i} className="text-teal-300 text-[9px] flex-1 text-center">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification cards */}
      <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-2xl p-3 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <div className="text-gray-800 text-xs font-bold">Stock Actualizado</div>
          <div className="text-gray-400 text-[10px]">Bodega Principal</div>
        </div>
      </div>

      <div className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-2xl p-3 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <div className="text-gray-800 text-xs font-bold">Nueva Cotización</div>
          <div className="text-gray-400 text-[10px]">Pendiente de revisión</div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(10px) rotate(-3deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
        .animate-slide-right { animation: slideRight 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* Hero Section */}
      <div className="relative min-h-screen flex">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            background: 'linear-gradient(135deg, #0d9488, #0f766e, #115e59, #134e4a, #0f766e, #0d9488)',
            backgroundSize: '400% 400%',
          }}
        />

        {/* Mesh pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />

        {/* Floating shapes */}
        <FloatingShape className="w-72 h-72 bg-orange-400 top-10 -left-20 animate-float" />
        <FloatingShape className="w-48 h-48 bg-yellow-400 top-1/3 right-20 animate-float-slow" />
        <FloatingShape className="w-32 h-32 bg-teal-300 bottom-20 left-1/4 animate-float" style={{ animationDelay: '2s' }} />
        <FloatingShape className="w-56 h-56 bg-emerald-400 bottom-10 right-10 animate-float-slow" style={{ animationDelay: '1s' }} />
        <FloatingShape className="w-20 h-20 bg-white top-20 right-1/3 animate-float" style={{ animationDelay: '3s' }} />

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12 min-h-screen">

            {/* Left - Text content */}
            <div className="lg:w-1/2 text-white space-y-8">
              {/* Badge */}
              <div className="animate-slide-up opacity-0">
                <span className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white text-2xl font-extrabold tracking-wide px-6 py-3 rounded-full border border-orange-400/40 shadow-lg shadow-orange-500/10">
                  <span className="w-3 h-3 rounded-full bg-orange-400 animate-pulse" />
                  Stockly
                </span>
              </div>

              {/* Title */}
              <div className="animate-slide-up opacity-0 delay-100">
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1]">
                  Gestiona tu{' '}
                  <span className="relative">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300">
                      inventario
                    </span>
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-orange-400/30 rounded-full -z-0" />
                  </span>
                  <br />
                  como nunca
                </h1>
              </div>

              {/* Description */}
              <p className="text-lg text-teal-100 max-w-lg leading-relaxed animate-slide-up opacity-0 delay-200">
                Un sistema ERP moderno y potente que transforma la gestión de inventario.
                Control total de bodegas, materiales, compras y movimientos en una sola plataforma.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 animate-slide-up opacity-0 delay-300">
                <Link
                  to="/login"
                  className="group relative inline-flex items-center gap-2 bg-orange-500 text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105"
                >
                  Comenzar Ahora
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Conocer Más
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 animate-slide-up opacity-0 delay-400">
                {[
                  { value: '4', label: 'Roles' },
                  { value: '10+', label: 'Módulos' },
                  { value: '24/7', label: 'Disponible' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-extrabold text-orange-400">{stat.value}</div>
                    <div className="text-teal-200 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Dashboard mockup */}
            <div className="lg:w-1/2 animate-slide-up opacity-0 delay-300">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative bg-gray-950 py-24 px-6">
        {/* Subtle gradient at top */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-orange-400 font-semibold text-sm tracking-widest uppercase mb-4">Funcionalidades</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Todo lo que necesitas{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
                en un solo lugar
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Herramientas diseñadas para optimizar cada proceso de tu cadena de suministro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              color="bg-gradient-to-br from-teal-500 to-teal-600"
              title="Gestión de Bodegas"
              description="Administra múltiples bodegas, ubica materiales y controla el stock en tiempo real con reportes detallados."
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0H21" />
                </svg>
              }
            />
            <FeatureCard
              color="bg-gradient-to-br from-orange-500 to-amber-500"
              title="Catálogo de Materiales"
              description="Base de datos completa de materiales con categorías, precios, proveedores y disponibilidad por bodega."
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              }
            />
            <FeatureCard
              color="bg-gradient-to-br from-purple-500 to-violet-600"
              title="Órdenes de Compra"
              description="Crea, gestiona y da seguimiento a órdenes de compra con estados, proveedores y detalle de artículos."
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              }
            />
            <FeatureCard
              color="bg-gradient-to-br from-emerald-500 to-green-600"
              title="Cotizaciones"
              description="Genera y administra cotizaciones con múltiples proveedores, comparación de precios y estados de seguimiento."
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <FeatureCard
              color="bg-gradient-to-br from-blue-500 to-indigo-600"
              title="Solicitudes de Compra"
              description="Flujo completo de solicitudes con aprobación, seguimiento y vinculación directa con órdenes de compra."
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
            />
            <FeatureCard
              color="bg-gradient-to-br from-rose-500 to-pink-600"
              title="Movimientos e Inventario"
              description="Registra entradas, salidas, transferencias y ajustes con trazabilidad completa y auditoría en tiempo real."
              icon={
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="relative bg-gray-950 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-10 lg:p-14 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-300/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold text-white mb-3">Diseñado para cada rol</h3>
              <p className="text-teal-200 mb-8 max-w-lg">Un sistema pensado para todos los actores de la cadena de suministro de la empresa.</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { role: 'Administrador', desc: 'Control total del sistema', icon: '👑', gradient: 'from-orange-400 to-amber-500' },
                  { role: 'Solicitante', desc: 'Crea y gestiona solicitudes', icon: '📋', gradient: 'from-blue-400 to-indigo-500' },
                  { role: 'Bodeguero', desc: 'Gestiona inventario y stock', icon: '📦', gradient: 'from-emerald-400 to-green-500' },
                  { role: 'Comprador', desc: 'Administra compras y órdenes', icon: '🛒', gradient: 'from-purple-400 to-violet-500' },
                ].map((item) => (
                  <div key={item.role} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/20 transition-all hover:scale-105">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-lg mb-3 shadow-lg`}>
                      {item.icon}
                    </div>
                    <div className="text-white font-bold">{item.role}</div>
                    <div className="text-teal-200 text-sm mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gray-950 py-20 px-6">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">¿Listo para empezar?</h2>
          <p className="text-gray-400 text-lg mb-8">Accede al sistema y comienza a gestionar tu inventario de forma inteligente.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg px-10 py-4 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105"
          >
            Iniciar Sesión
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-gray-600 text-xs mt-8">Proyecto Integrador — ERP de Inventario &copy; 2025</p>
        </div>
      </div>
    </div>
  );
}
