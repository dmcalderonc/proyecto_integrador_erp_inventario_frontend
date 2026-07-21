import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, Tag, Ruler } from 'lucide-react';
import { publicMaterialesApi } from '../../api/public-materiales.api';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

interface FloatingShapeProps {
  className: string;
  style?: React.CSSProperties;
}

function FloatingShape({ className, style }: FloatingShapeProps) {
  return <div className={`absolute rounded-full opacity-20 blur-sm animate-pulse ${className}`} style={style} />;
}

export default function PublicMaterialDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: material, isLoading, isError } = useQuery({
    queryKey: ['publicMaterial', id],
    queryFn: async () => {
      const res = await publicMaterialesApi.getById(Number(id));
      return res.data;
    },
    enabled: !!id,
  });

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
      <div className="relative z-10 flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link 
          to="/materiales" 
          className="inline-flex items-center gap-2 text-sm text-[#06B6D4] hover:text-[#10B981] transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>

        {isLoading ? (
          /* Skeleton Loader Adaptado */
          <div className="bg-[#111D4A] rounded-3xl border border-[#334155] p-8 animate-pulse shadow-2xl">
            <div className="h-8 bg-[#1E293B] rounded-xl w-1/3 mb-4"></div>
            <div className="h-4 bg-[#1E293B] rounded-lg w-1/2 mb-3"></div>
            <div className="h-4 bg-[#1E293B] rounded-lg w-2/3"></div>
          </div>
        ) : isError || !material || (material as any).statusCode ? (
          /* Estado de Error / No Encontrado */
          <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-12 text-center shadow-2xl animate-slide-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-[#334155] mb-4 text-[#94A3B8]">
              <Package size={36} />
            </div>
            <p className="text-[#FFFFFF] font-bold text-xl mb-1">Material no encontrado</p>
            <p className="text-[#94A3B8] text-sm mb-6">El producto que buscas no existe o fue retirado del sistema.</p>
            <Link 
              to="/materiales" 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1E293B] text-[#FFFFFF] font-semibold text-sm rounded-xl border border-[#334155] hover:bg-white/10 transition-all"
            >
              Volver al catálogo
            </Link>
          </div>
        ) : (
          /* Tarjeta de Detalle del Material */
          <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 sm:p-10 shadow-2xl animate-slide-up">
            {(material as any).imagen && (
              <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 bg-[#0A1128] border border-[#334155]">
                <img src={(material as any).imagen} alt={material.nombre} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-mono bg-[#0A1128] text-[#10B981] px-3.5 py-1.5 rounded-xl border border-[#334155] font-semibold">
                SKU: {material.sku}
              </span>
              {material.unidadMedida && (
                <span className="text-xs bg-[#06B6D4]/10 text-[#06B6D4] px-3.5 py-1.5 rounded-xl border border-[#06B6D4]/30 font-semibold">
                  {material.unidadMedida.nombre} ({material.unidadMedida.simbolo})
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] mb-4">{material.nombre}</h1>

            {material.descripcion && (
              <p className="text-[#94A3B8] text-base leading-relaxed mb-8">{material.descripcion}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#334155]">
              {material.categoria && (
                <div className="flex items-center gap-3.5 p-4 bg-[#0A1128] rounded-2xl border border-[#334155]">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                    <Tag size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Categoría</p>
                    <p className="font-semibold text-[#FFFFFF]">{material.categoria.nombre}</p>
                  </div>
                </div>
              )}
              {material.unidadMedida && (
                <div className="flex items-center gap-3.5 p-4 bg-[#0A1128] rounded-2xl border border-[#334155]">
                  <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
                    <Ruler size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8]">Unidad de Medida</p>
                    <p className="font-semibold text-[#FFFFFF]">{material.unidadMedida.nombre}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}