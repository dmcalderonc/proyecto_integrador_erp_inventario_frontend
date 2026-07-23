import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Menu, X } from 'lucide-react';

const IMG = {
  hero_fallback:
    'https://images.unsplash.com/photo-1586528116022-aeda1613c63d?w=1920&h=1080&fit=crop&auto=format',
  warehouse_aisle:
    'https://images.unsplash.com/photo-1664382953403-fc1ac77073a0?w=900&h=600&fit=crop&auto=format',
  workers_tablet:
    'https://images.unsplash.com/photo-1648824572347-517357c9c44e?w=900&h=600&fit=crop&auto=format',
  forklift:
    'https://images.unsplash.com/photo-1645736315000-6f788915923b?w=900&h=600&fit=crop&auto=format',
  boxes:
    'https://images.unsplash.com/photo-1721937127582-ed331de95a04?w=1200&h=700&fit=crop&auto=format',
};

const features = [
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0H21" />
      </svg>
    ),
    title: 'Inventario en tiempo real',
    desc: 'Sincronización instantánea entre almacenes. Control total del stock con reportes detallados y alertas automáticas.',
    img: IMG.warehouse_aisle,
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    title: 'Catálogo de Materiales',
    desc: 'Base de datos completa con categorías, unidades de medida, y disponibilidad por bodega.',
    img: IMG.workers_tablet,
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.147-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Órdenes de Compra',
    desc: 'Crea, gestiona y da seguimiento a órdenes de compra con estados, proveedores y recepción de materiales.',
    img: IMG.forklift,
  },
];

const smallFeatures = [
  {
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: 'Alertas automáticas',
    desc: 'Notificaciones cuando el stock baja del umbral mínimo configurado.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Reportes avanzados',
    desc: 'KPIs de rotación, valorización de inventario y análisis en tiempo real.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Permisos por rol',
    desc: 'Administradores, bodegueros, compradores y solicitantes ven solo lo que necesitan.',
  },
];

const plans = [
  {
    name: 'Básico',
    price: 'Gratis',
    desc: 'Para equipos pequeños.',
    features: ['Hasta 500 materiales', '2 bodegas', 'Reportes básicos', 'Soporte por email'],
    cta: 'Comenzar ahora',
    highlight: false,
  },
  {
    name: 'Profesional',
    price: '$49',
    desc: 'El favorito en expansión.',
    features: ['Materiales ilimitados', '10 bodegas', 'Alertas automáticas', 'Reportes avanzados', 'Soporte prioritario'],
    cta: 'Probar 14 días gratis',
    highlight: true,
  },
  {
    name: 'Empresa',
    price: 'A medida',
    desc: 'Para operaciones a gran escala.',
    features: ['Todo en Profesional', 'Bodegas ilimitadas', 'API dedicada', 'Permisos avanzados', 'Onboarding personalizado'],
    cta: 'Contactar ventas',
    highlight: false,
  },
];

function Sparkline({ isDark }: { isDark: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const values = [4200, 3800, 5100, 4700, 6300, 5900, 7200, 6800];
  const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'];
  const W = 400, H = 120, P = 10;
  const min = Math.min(...values);
  const max = Math.max(...values);

  const xs = values.map((_, i) => P + (i / (values.length - 1)) * (W - P * 2));
  const ys = values.map((v) => P + ((max - v) / (max - min)) * (H - P * 2 - 16));
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const area = `${line} L${xs[xs.length - 1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H} Z`;

  const tooltipBg = isDark ? '#1e293b' : '#f1f5f9';
  const tooltipText = isDark ? '#ffffff' : '#0f172a';
  const labelColor = isDark ? '#6b7d96' : '#94a3b8';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto relative overflow-hidden rounded-md" style={{ height: 150 }} preserveAspectRatio="none">
      <path d={area} fill="#10B981" fillOpacity={0.12} />
      <path d={line} fill="none" stroke="#10B981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {xs.map((x, i) => (
        <text key={`lbl-${i}`} x={x} y={H - 2} textAnchor="middle" fill={labelColor} fontSize={10} style={{ fontFamily: "var(--font-mono)" }}>
          {labels[i]}
        </text>
      ))}

      {xs.map((x, i) => (
        <rect
          key={`hit-${i}`}
          x={x - (W / xs.length) / 2}
          y={0}
          width={W / xs.length}
          height={H}
          fill="transparent"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'pointer' }}
        />
      ))}

      {hovered !== null && (
        <g style={{ pointerEvents: 'none' }}>
          <rect x={xs[hovered] - 30} y={ys[hovered] - 28} width="60" height="20" fill={tooltipBg} rx="4" />
          <text x={xs[hovered]} y={ys[hovered] - 14} textAnchor="middle" fill={tooltipText} fontSize="10" fontWeight="bold">
            {values[hovered]}
          </text>
          <circle cx={xs[hovered]} cy={ys[hovered]} r="4" fill="#10B981" stroke={tooltipBg} strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoPaused) videoRef.current.play();
    else videoRef.current.pause();
    setVideoPaused(!videoPaused);
  };

  const navItems = [
    { label: 'Características', href: '#features' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precios', href: '#precios' },
  ];

  return (
    <div className="relative min-h-screen bg-base overflow-x-hidden max-w-[100vw]">

      {/* ─── NAVBAR ─── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-base/90 backdrop-blur-xl border-b border-border-subtle shadow-lg shadow-black/10'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
              <img src="/favicon.png" alt="StockLy" className="w-5 h-5 object-contain" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">stockly</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="text-sm text-text-muted hover:text-text-primary transition-colors">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-text-muted hover:bg-elevated hover:text-text-primary transition-colors cursor-pointer"
              title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {isDark ? <Sun size={18} /> : (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            <div className="h-6 w-px bg-border-subtle" />

            <Link to="/login" className="text-sm text-text-muted hover:text-text-primary transition-colors">
              Iniciar sesión
            </Link>
            <Link
              to="/login"
              className="text-sm px-5 py-2 rounded-lg bg-accent text-white font-bold hover:bg-accent-hover transition-colors shadow-lg shadow-accent/25"
            >
              Empezar gratis
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-muted hover:bg-elevated transition-colors cursor-pointer"
            >
              {isDark ? <Sun size={18} /> : (
                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
            <button className="text-text-muted" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-surface border-t border-border-subtle px-6 py-5 flex flex-col gap-4">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="text-sm text-text-secondary hover:text-text-primary">
                {item.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm px-4 py-2.5 rounded-lg bg-accent text-white font-bold text-center">
              Empezar gratis
            </Link>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-base w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={IMG.hero_fallback}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src="/video-bg.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-r from-base via-base/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-base/30" />

          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 bg-accent" />
        </div>

        <button
          onClick={toggleVideo}
          className="absolute bottom-8 right-8 z-20 w-10 h-10 rounded-full bg-text-primary/10 backdrop-blur-md border border-text-primary/20 flex items-center justify-center text-text-primary hover:bg-text-primary/20 transition-colors cursor-pointer"
          title={videoPaused ? 'Reproducir' : 'Pausar'}
        >
          {videoPaused ? (
            <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
          )}
        </button>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Dashboard Card */}
          <div className="hidden lg:block min-w-0 w-full relative">
            <div className="rounded-2xl border border-border-subtle bg-surface/80 backdrop-blur-xl p-5 shadow-2xl shadow-black/40 w-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] text-text-muted mb-0.5 tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    FLUJO DE STOCK · 2026
                  </p>
                  <p className="text-2xl font-extrabold text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                    7.240 unidades
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs text-success font-semibold bg-success-bg px-3 py-1.5 rounded-full border border-success/20">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                  +14.2%
                </span>
              </div>

              <Sparkline isDark={isDark} />

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[
                  { label: 'En bodega', value: '4.810', color: 'text-accent' },
                  { label: 'En tránsito', value: '1.340', color: 'text-warning' },
                  { label: 'Bajo mínimo', value: '12 SKU', color: 'text-danger' },
                ].map((s) => (
                  <div key={s.label} className="bg-elevated rounded-xl p-3 min-w-0">
                    <p className="text-[10px] text-text-muted mb-1 truncate" style={{ fontFamily: "var(--font-mono)" }}>{s.label}</p>
                    <p className={`text-sm font-extrabold ${s.color} truncate`} style={{ fontFamily: "var(--font-heading)" }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 bg-warning-bg border border-warning/20 rounded-xl px-3 py-2.5">
                <svg className="w-3.5 h-3.5 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-xs text-text-secondary break-words">
                  <span className="font-semibold text-text-primary">Tornillo M8 Inox</span> · Solo 45 uds. — mínimo recomendado: 200
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-text-muted border-t border-border-subtle pt-3">
                <svg className="w-3 h-3 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                <span style={{ fontFamily: "var(--font-mono)" }}>Sincronizado hace 2 seg.</span>
              </div>
            </div>
          </div>

          {/* Texts & CTA */}
          <div className="min-w-0 flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent text-xs font-medium mb-7 self-start" style={{ fontFamily: "var(--font-mono)" }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              ERP de Inventario Inteligente
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.0] tracking-tighter text-text-primary mb-6 break-words" style={{ fontFamily: "var(--font-heading)" }}>
              Inventario<br />que nunca<br />
              <span className="text-success">se pierde.</span>
            </h1>

            <p className="text-lg text-text-secondary leading-relaxed mb-9 w-full max-w-xl break-words">
              Stockly es el ERP de inventario que conecta tus almacenes, controla el stock y automatiza procesos — para que tu equipo opere sin fricciones.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-white font-bold hover:bg-accent-hover transition-all hover:scale-[1.02] shadow-xl shadow-accent/25 text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                Empezar gratis
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border-subtle text-text-primary hover:bg-elevated transition-colors text-sm font-medium backdrop-blur-sm">
                Ver funcionalidades
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </a>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {['CM', 'MT', 'RS', 'LV'].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-elevated border-2 border-base flex items-center justify-center text-xs font-bold text-text-muted">
                    {i}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 fill-warning text-warning" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-text-muted">
                  <span className="text-text-primary font-semibold">850+</span> equipos confían en Stockly
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative w-full py-20 px-6 border-y border-border-subtle bg-surface/50 flex justify-center">
        <div className="max-w-5xl w-full mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: '4', label: 'Roles de usuario' },
            { value: '10+', label: 'Módulos activos' },
            { value: '99.9%', label: 'Uptime garantizado' },
            { value: '24/7', label: 'Disponibilidad' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-5xl font-black text-text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>{s.value}</p>
              <p className="text-sm text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative w-full min-h-screen flex flex-col items-center justify-center py-12 px-6 bg-elevated/30">
        <div className="max-w-7xl w-full mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-accent font-medium tracking-widest uppercase mb-3" style={{ fontFamily: "var(--font-mono)" }}>Características</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>
              Todo lo que necesitas,<br />
              <span className="text-accent">nada que sobra.</span>
            </h2>
          </div>

          <div className="space-y-8">
            {features.map((f, i) => (
              <div key={f.title} className={`grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border-subtle group hover:border-accent/30 transition-colors min-w-0 ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                <div className="relative h-72 md:h-auto overflow-hidden bg-elevated">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/80" />
                </div>
                <div className="bg-surface p-10 flex flex-col justify-center min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3" style={{ fontFamily: "var(--font-heading)" }}>{f.title}</h3>
                  <p className="text-text-secondary leading-relaxed mb-6 break-words">{f.desc}</p>
                  <a href="#features" className="inline-flex items-center gap-2 text-accent text-sm font-semibold hover:gap-3 transition-all">
                    Conocer más
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-8">
            {smallFeatures.map((f) => (
              <div key={f.title} className="group bg-surface border border-border-subtle rounded-2xl p-6 hover:border-accent/40 transition-colors min-w-0">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed break-words">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="como-funciona" className="relative w-full min-h-screen flex flex-col items-center justify-center py-12 px-6">
        <div className="max-w-7xl w-full mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden h-[520px] bg-elevated min-w-0 w-full">
            <img src={IMG.boxes} alt="Almacén con cajas y pallets organizados" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 bg-surface/90 backdrop-blur-xl border border-border-subtle rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted mb-0.5" style={{ fontFamily: "var(--font-mono)" }}>TIEMPO DE ONBOARDING PROMEDIO</p>
                <p className="text-2xl font-black text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>&lt; 1 día</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="min-w-0 w-full flex flex-col">
            <p className="text-xs text-accent font-medium tracking-widest uppercase mb-4" style={{ fontFamily: "var(--font-mono)" }}>Cómo funciona</p>
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-text-primary mb-10" style={{ fontFamily: "var(--font-heading)" }}>
              En marcha en<br />menos de un día.
            </h2>
            <div className="space-y-8">
              {[
                { num: '01', title: 'Registra tu equipo', desc: 'Crea tu cuenta, asigna roles a tus colaboradores (bodeguero, comprador, solicitante) y empieza a operar.' },
                { num: '02', title: 'Carga tu inventario', desc: 'Registra materiales con categorías y unidades de medida. Define bodegas y ubicaciones en minutos.' },
                { num: '03', title: 'Opera con confianza', desc: 'Tu equipo trabaja sobre datos en tiempo real. Stockly se encarga del resto.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-6 group">
                  <div className="shrink-0 text-4xl font-black text-accent/20 group-hover:text-accent/40 transition-colors leading-none mt-1" style={{ fontFamily: "var(--font-heading)" }}>
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-lg mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>{step.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed break-words">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRECIOS ─── */}
      <section id="precios" className="relative w-full min-h-screen flex flex-col items-center justify-center py-12 px-6">
        <div className="max-w-5xl w-full mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-medium tracking-widest uppercase mb-3" style={{ fontFamily: "var(--font-mono)" }}>Precios</p>
            <h2 className="text-4xl font-black tracking-tight text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>Planes que crecen contigo.</h2>
            <p className="text-text-muted mt-3 text-sm">Sin costos ocultos. Cancela cuando quieras.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 flex flex-col items-center text-center border transition-all hover:scale-[1.02] min-w-0 w-full ${plan.highlight ? 'bg-accent/5 border-accent/40 shadow-xl shadow-accent/10' : 'bg-surface border-border-subtle'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white text-[10px] font-black tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
                    MÁS POPULAR
                  </div>
                )}
                <div className="mb-6 w-full">
                  <p className="text-xl font-black text-text-primary mb-1" style={{ fontFamily: "var(--font-heading)" }}>{plan.name}</p>
                  <p className="text-xs text-text-muted">{plan.desc}</p>
                </div>
                <div className="mb-6 w-full flex justify-center">
                  {plan.price === 'A medida' ? (
                    <span className="text-3xl font-black text-text-primary" style={{ fontFamily: "var(--font-heading)" }}>A medida</span>
                  ) : (
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-5xl font-black text-text-primary leading-none" style={{ fontFamily: "var(--font-heading)" }}>
                        {plan.price === 'Gratis' ? 'Gratis' : `$${plan.price}`}
                      </span>
                      {plan.price !== 'Gratis' && <span className="text-text-muted text-sm mb-1">/mes</span>}
                    </div>
                  )}
                </div>
                <ul className="space-y-2.5 mb-8 flex-1 w-full flex flex-col items-center">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-text-secondary break-words text-left w-full justify-center">
                      <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/login" className={`w-full block text-center py-3 rounded-xl text-sm font-bold transition-all ${plan.highlight ? 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20' : 'border border-border-subtle text-text-primary hover:border-accent/40'}`} style={{ fontFamily: "var(--font-heading)" }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img src={IMG.warehouse_aisle} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-base via-transparent to-base" />
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(16,185,129,0.08), transparent)' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-6">
            <svg className="w-7 h-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-text-primary mb-4 break-words" style={{ fontFamily: "var(--font-heading)" }}>
            Tu inventario bajo control,{' '}
            <span className="text-success">desde hoy.</span>
          </h2>
          <p className="text-lg text-text-secondary mb-10 break-words max-w-xl">
            Prueba Stockly gratis. Sin tarjeta de crédito, sin letra chica.
          </p>
          <div className="flex justify-center w-full">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-white font-bold hover:bg-accent-hover transition-all hover:scale-[1.02] shadow-xl shadow-accent/25 text-sm" style={{ fontFamily: "var(--font-heading)" }}>
              Comenzar ahora
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative w-full border-t border-border-subtle py-14 px-6 bg-surface/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
          <div className="max-w-xs min-w-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                <img src="/favicon.png" alt="StockLy" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-xl font-black text-text-primary">stockly</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed break-words">
              ERP de inventario inteligente para equipos que no pueden permitirse errores.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm w-full md:w-auto">
            {[
              { title: 'Producto', links: [{ label: 'Características', href: '#features' }, { label: 'Precios', href: '#precios' }, { label: 'Cómo funciona', href: '#como-funciona' }] },
              { title: 'Cuenta', links: [{ label: 'Iniciar sesión', href: '/login' }, { label: 'Registrarse', href: '/login' }] },
              { title: 'Legal', links: [{ label: 'Privacidad', href: '#' }, { label: 'Términos', href: '#' }] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-bold text-text-primary mb-4" style={{ fontFamily: "var(--font-heading)" }}>{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.href} className="text-text-muted hover:text-text-primary transition-colors">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-text-muted" style={{ fontFamily: "var(--font-mono)" }}>&copy; 2026 Stockly. Todos los derechos reservados.</p>
          <p className="text-xs text-text-muted">Hecho con precisión para operaciones que no fallan.</p>
        </div>
      </footer>
    </div>
  );
}
