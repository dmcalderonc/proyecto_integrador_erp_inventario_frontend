import { Link } from 'react-router-dom';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

interface FloatingShapeProps {
  className: string;
  style?: React.CSSProperties;
}

function FloatingShape({ className, style }: FloatingShapeProps) {
  return <div className={`absolute rounded-full opacity-20 blur-sm animate-pulse ${className}`} style={style} />;
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#94A3B8] flex flex-col justify-between overflow-hidden relative">
      <Navbar />

      {/* Estilos de animación consistentes */}
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
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
      `}</style>

      {/* Fondo degradado y rejilla */}
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

      {/* Formas flotantes */}
      <FloatingShape className="w-72 h-72 bg-[#10B981] top-10 -left-20 animate-float" />
      <FloatingShape className="w-48 h-48 bg-[#06B6D4] bottom-1/3 right-10 animate-float-slow" style={{ animationDelay: '1.5s' }} />
      <FloatingShape className="w-32 h-32 bg-[#10B981] bottom-10 left-1/4 animate-float" style={{ animationDelay: '2s' }} />

      {/* Contenido principal */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6 bg-[#111D4A] backdrop-blur-lg p-8 sm:p-10 rounded-3xl border border-[#334155] shadow-2xl animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div>
            <h1 className="text-7xl font-extrabold text-[#10B981] tracking-wider">
              404
            </h1>
            <h2 className="mt-2 text-2xl font-bold text-[#FFFFFF]">
              Página no encontrada
            </h2>
            <p className="mt-2 text-sm text-[#94A3B8] max-w-xs mx-auto">
              La página que estás buscando no existe o ha sido movida de ubicación.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 hover:shadow-[#0284C7]/40 hover:scale-[1.02] active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}