import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Package } from 'lucide-react';
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

export default function PublicMaterialesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('nombre');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const limit = 10;

  const { data: categorias } = useQuery({
    queryKey: ['publicCategorias'],
    queryFn: async () => {
      const res = await publicMaterialesApi.getCategorias();
      return res.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['publicMateriales', search, page, sort, order, categoryFilter],
    queryFn: async () => {
      const res = await publicMaterialesApi.getAll({
        search: search || undefined,
        categoria: categoryFilter ?? undefined,
        page,
        limit,
        sort,
        order,
      });
      return res.data;
    },
  });

  const materials = data?.data || [];
  const meta = data?.meta;

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
      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FFFFFF] mb-2">Catálogo de Materiales</h1>
        <p className="text-[#94A3B8] mb-8 text-base">Explora nuestro inventario de materiales disponibles</p>

        {/* Search + Sort + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o descripción..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all shadow-md"
            />
          </div>
          <select
            value={categoryFilter ?? ''}
            onChange={e => { setCategoryFilter(e.target.value ? Number(e.target.value) : null); setPage(1); }}
            className="bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer shadow-md transition-all"
          >
            <option value="" className="bg-[#111D4A]">Todas las categorías</option>
            {categorias?.map(c => <option key={c.id} value={c.id} className="bg-[#111D4A]">{c.nombre}</option>)}
          </select>
          <select
            value={`${sort}-${order}`}
            onChange={e => {
              const [s, o] = e.target.value.split('-');
              setSort(s);
              setOrder(o as 'ASC' | 'DESC');
              setPage(1);
            }}
            className="bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer shadow-md transition-all"
          >
            <option value="nombre-ASC" className="bg-[#111D4A]">Nombre (A-Z)</option>
            <option value="nombre-DESC" className="bg-[#111D4A]">Nombre (Z-A)</option>
            <option value="sku-ASC" className="bg-[#111D4A]">SKU (A-Z)</option>
            <option value="sku-DESC" className="bg-[#111D4A]">SKU (Z-A)</option>
            <option value="categoria-ASC" className="bg-[#111D4A]">Categoría (A-Z)</option>
          </select>
        </div>

        {meta && (
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
            {meta.total} resultado{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
          </p>
        )}

        {isLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[#111D4A] rounded-2xl border border-[#334155] p-6 animate-pulse shadow-lg">
                <div className="h-6 w-20 bg-[#1E293B] rounded-lg mb-4"></div>
                <div className="h-5 bg-[#1E293B] rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-[#1E293B] rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        ) : materials.length === 0 ? (
          /* Estado Vacío */
          <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-12 text-center shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-[#334155] mb-4 text-[#94A3B8]">
              <Package size={36} />
            </div>
            <p className="text-[#FFFFFF] font-bold text-lg mb-1">No se encontraron materiales</p>
            <p className="text-[#94A3B8] text-sm">Intenta ajustar los filtros o tus términos de búsqueda.</p>
          </div>
        ) : (
          <>
            {/* Grilla de Tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {materials.map((m: any) => (
                <Link
                  key={m.id}
                  to={`/materiales/${m.id}`}
                  className="group bg-[#111D4A] backdrop-blur-md rounded-2xl border border-[#334155] p-6 hover:border-[#10B981] hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono bg-[#0A1128] text-[#10B981] px-3 py-1 rounded-lg border border-[#334155] font-semibold">
                        {m.sku}
                      </span>
                      {m.unidadMedida && (
                        <span className="text-xs bg-[#06B6D4]/10 text-[#06B6D4] px-2.5 py-1 rounded-lg font-semibold border border-[#06B6D4]/20">
                          {m.unidadMedida.simbolo}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#FFFFFF] text-lg mb-2 group-hover:text-[#10B981] transition-colors">
                      {m.nombre}
                    </h3>
                    <p className="text-sm text-[#94A3B8] line-clamp-2 mb-4 leading-relaxed">
                      {m.descripcion || 'Sin descripción disponible'}
                    </p>
                  </div>

                  {m.categoria && (
                    <div>
                      <span className="inline-block text-xs bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full font-medium border border-[#10B981]/20">
                        {m.categoria.nombre}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Paginador */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 rounded-xl border border-[#334155] bg-[#111D4A] text-[#FFFFFF] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (arr[i - 1] as number) !== p - 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`dots-${i}`} className="px-2 text-[#94A3B8]">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          page === p
                            ? 'bg-[#06B6D4] text-white border border-[#06B6D4] shadow-lg shadow-[#06B6D4]/30'
                            : 'bg-[#111D4A] border border-[#334155] text-[#94A3B8] hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="p-2.5 rounded-xl border border-[#334155] bg-[#111D4A] text-[#FFFFFF] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}