import { Link } from 'react-router-dom';

// Marcadores de posición para Navbar y Footer con tus colores aplicados
const Navbar = () => (
  <div className="relative z-50 h-16 bg-[#0A1128] text-white p-4 flex items-center justify-between max-w-7xl mx-auto px-6 border-b border-[#334155]">
    <div className="text-2xl font-bold flex items-center gap-2 text-[#FFFFFF]">
      <div className="w-8 h-8 rounded-lg bg-[#10B981]"></div>
      Stockly
    </div>
    <div className="flex gap-4 items-center">
      <a href="#features" className="text-[#94A3B8] hover:text-[#FFFFFF]">Funciones</a>
      <Link to="/login" className="bg-[#1E293B] text-[#FFFFFF] px-4 py-2 rounded-lg hover:bg-white/10 border border-[#334155]">Entrar</Link>
    </div>
  </div>
);

const Footer = () => (
  <div className="bg-[#0A1128] text-[#94A3B8] p-6 text-center text-sm border-t border-[#334155]">
    &copy; 2025 Stockly ERP. Todos los derechos reservados.
  </div>
);

interface FloatingShapeProps {
  className: string;
  style?: React.CSSProperties;
}

function FloatingShape({ className, style }: FloatingShapeProps) {
  return <div className={`absolute rounded-full opacity-20 blur-sm animate-pulse ${className}`} style={style} />;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="relative group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-[#334155] hover:bg-white/10 hover:border-[#94A3B8] transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-[#FFFFFF] font-bold text-lg mb-2">{title}</h3>
      <p className="text-[#94A3B8] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative w-full max-w-xl mx-auto lg:mx-0">
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-[#FFFFFF] font-bold text-sm">Panel de Control</span>
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
            { label: 'Bodegas', value: '8', change: '+2', color: 'bg-[#10B981]' },
            { label: 'Movimientos', value: '356', change: '+28%', color: 'bg-purple-500' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0A1128] rounded-xl p-3 border border-[#334155]">
              <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`} />
              <div className="text-[#FFFFFF] font-bold text-lg">{stat.value}</div>
              <div className="text-[#94A3B8] text-xs">{stat.label}</div>
              <div className="text-green-400 text-xs font-semibold mt-1">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Chart mockup */}
        <div className="bg-[#0A1128] rounded-xl p-4 border border-[#334155]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#FFFFFF] text-xs font-semibold">Movimientos por Mes</span>
            <span className="text-[#94A3B8] text-xs">2025</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md ${i === 11 ? 'bg-[#10B981]' : 'bg-teal-400/60'} transition-all duration-500`}
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
              <span key={i} className="text-[#94A3B8] text-[9px] flex-1 text-center">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification cards */}
      <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-2xl p-3 flex items-center gap-3 animate-bounce border border-[#334155]" style={{ animationDuration: '3s' }}>
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

      <div className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-2xl p-3 flex items-center gap-3 animate-bounce border border-[#334155]" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
    <div className="min-h-screen bg-[#0A1128] text-[#94A3B8]">
      <Navbar />

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
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            background: 'linear-gradient(135deg, #0A1128, #111D4A, #1E293B, #111D4A, #0A1128)',
            backgroundSize: '400% 400%',
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating shapes */}
        <FloatingShape className="w-72 h-72 bg-[#10B981] top-10 -left-20 animate-float" />
        <FloatingShape className="w-48 h-48 bg-[#06B6D4] top-1/3 right-20 animate-float-slow" style={{ animationDelay: '1.5s' }} />
        <FloatingShape className="w-32 h-32 bg-[#10B981] bottom-20 left-1/4 animate-float" style={{ animationDelay: '2s' }} />
        <FloatingShape className="w-56 h-56 bg-white bottom-10 right-10 animate-float-slow" style={{ animationDelay: '1s', opacity: 0.1 }} />
        <FloatingShape className="w-20 h-20 bg-[#10B981] top-20 right-1/3 animate-float" style={{ animationDelay: '3s' }} />

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center gap-12">
            {/* Left - Text content */}
            <div className="lg:w-1/2 text-white space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="animate-slide-up opacity-0">
                <span className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm text-[#FFFFFF] text-2xl font-extrabold tracking-wide px-6 py-3 rounded-full border border-[#334155] shadow-lg">
                  <span className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse" />
                  Stockly
                </span>
              </div>

              <div className="animate-slide-up opacity-0 delay-100">
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-[#FFFFFF]">
                  Gestiona tu{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-[#10B981]">
                      inventario
                    </span>
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-[#10B981]/20 rounded-full z-0" />
                  </span>
                  <br />
                  como nunca
                </h1>
              </div>

              <p className="text-lg text-[#94A3B8] max-w-lg leading-relaxed animate-slide-up opacity-0 delay-200">
                Un sistema ERP moderno y potente que transforma la gestión de inventario.
                Control total de bodegas, materiales, compras y movimientos en una sola plataforma.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-slide-up opacity-0 delay-300">
                <Link
                  to="/login"
                  className="group relative inline-flex items-center gap-2 bg-[#06B6D4] text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-[#0284C7] transition-all shadow-xl shadow-[#06B6D4]/30 hover:shadow-[#0284C7]/50 hover:scale-105"
                >
                  Comenzar Ahora
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 bg-[#1E293B] backdrop-blur-sm text-[#FFFFFF] font-semibold text-lg px-8 py-4 rounded-2xl border border-[#334155] hover:bg-[#1E293B]/80 transition-all"
                >
                  <svg className="w-5 h-5 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Conocer Más
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4 animate-slide-up opacity-0 delay-400 w-full max-w-lg mx-auto lg:mx-0">
                {[
                  { value: '4', label: 'Roles' },
                  { value: '10+', label: 'Módulos' },
                  { value: '24/7', label: 'Disponible' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="text-3xl font-extrabold text-[#10B981]">{stat.value}</div>
                    <div className="text-[#94A3B8] text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Dashboard mockup */}
            <div className="lg:w-1/2 animate-slide-up opacity-0 delay-300 mt-12 lg:mt-0 flex justify-center lg:justify-end w-full overflow-visible">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative bg-[#0A1128] py-24 px-6 mt-[-1px] border-t border-[#334155]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-[#10B981] font-semibold text-sm tracking-widest uppercase mb-4">Funcionalidades</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#FFFFFF] mb-4">
              Todo lo que necesitas{' '}
              <span className="text-[#10B981]">
                en un solo lugar
              </span>
            </h2>
            <p className="text-[#94A3B8] max-w-2xl mx-auto text-lg leading-relaxed">
              Herramientas diseñadas para optimizar cada proceso de tu cadena de suministro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              color="bg-[#111D4A]"
              title="Gestión de Bodegas"
              description="Administra múltiples bodegas, ubica materiales y controla el stock en tiempo real con reportes detallados."
              icon={
                <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0H21" />
                </svg>
              }
            />
            <FeatureCard
              color="bg-[#111D4A]"
              title="Catálogo de Materiales"
              description="Base de datos completa de materiales con categorías, precios, proveedores y disponibilidad por bodega."
              icon={
                <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              }
            />
            <FeatureCard
              color="bg-[#111D4A]"
              title="Órdenes de Compra"
              description="Crea, gestiona y da seguimiento a órdenes de compra con estados, proveedores y detalle de artículos."
              icon={
                <svg className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div className="relative bg-[#0A1128] py-20 px-6 mt-[-1px] border-t border-[#334155]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#111D4A] rounded-3xl p-10 lg:p-14 relative overflow-hidden shadow-2xl border border-[#334155]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#06B6D4]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold text-[#FFFFFF] mb-3">Diseñado para cada rol</h3>
              <p className="text-[#94A3B8] mb-8 max-w-lg">Un sistema pensado para todos los actores de la cadena de suministro de la empresa.</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { role: 'Administrador', desc: 'Control total', icon: '👑' },
                  { role: 'Solicitante', desc: 'Crea solicitudes', icon: '📋' },
                  { role: 'Bodeguero', desc: 'Gestiona stock', icon: '📦' },
                  { role: 'Comprador', desc: 'Gestiona compras', icon: '🛒' },
                ].map((item) => (
                  <div key={item.role} className="bg-[#0A1128] rounded-2xl p-5 border border-[#334155] hover:bg-white/5 transition-all hover:scale-105 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-[#1E293B] border border-[#334155] flex items-center justify-center text-lg mb-3 shadow-lg">
                      {item.icon}
                    </div>
                    <div className="text-[#FFFFFF] font-bold text-sm sm:text-base">{item.role}</div>
                    <div className="text-[#94A3B8] text-xs mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-[#0A1128] py-28 px-6 mt-[-1px] border-t border-[#334155]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#10B981]/50 to-transparent" />
        <div className="max-w-3xl mx-auto text-center animate-fade-in opacity-0 delay-200">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#FFFFFF] mb-6">¿Listo para empezar?</h2>
          <p className="text-[#94A3B8] text-lg mb-10 max-w-xl mx-auto leading-relaxed">Accede al sistema y comienza a gestionar tu inventario de forma inteligente y eficiente.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-[#06B6D4] text-white font-bold text-xl px-12 py-5 rounded-2xl hover:bg-[#0284C7] transition-all shadow-xl shadow-[#06B6D4]/25 hover:shadow-[#0284C7]/40 hover:scale-105 border border-[#334155]"
          >
            Iniciar Sesión
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

