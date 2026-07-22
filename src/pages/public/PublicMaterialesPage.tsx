import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { publicMaterialesApi } from '../../api/public-materiales.api';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

export default function PublicMaterialesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('nombre');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['publicMateriales', search, page, sort, order],
    queryFn: async () => {
      const res = await publicMaterialesApi.getAll({ search: search || undefined, page, limit, sort, order });
      return res.data;
    },
  });

  const materials = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="min-h-screen bg-base text-text-secondary flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-2">Catálogo de Materiales</h1>
        <p className="text-text-secondary mb-8 text-base">Explora nuestro inventario de materiales disponibles</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o descripción..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-surface text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
          <select
            value={`${sort}-${order}`}
            onChange={e => {
              const [s, o] = e.target.value.split('-');
              setSort(s);
              setOrder(o as 'ASC' | 'DESC');
              setPage(1);
            }}
            className="bg-surface text-text-primary border border-border-subtle rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 cursor-pointer transition-all"
          >
            <option value="nombre-ASC">Nombre (A-Z)</option>
            <option value="nombre-DESC">Nombre (Z-A)</option>
            <option value="sku-ASC">SKU (A-Z)</option>
            <option value="sku-DESC">SKU (Z-A)</option>
            <option value="categoria-ASC">Categoría (A-Z)</option>
          </select>
        </div>

        {meta && (
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            {meta.total} resultado{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-surface rounded-xl border border-border-subtle p-6 animate-pulse">
                <div className="h-6 w-20 bg-elevated rounded-lg mb-4" />
                <div className="h-5 bg-elevated rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-elevated rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border-subtle p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-elevated border border-border-subtle mb-4 text-text-muted">
              <Package size={36} />
            </div>
            <p className="text-text-primary font-bold text-lg mb-1">No se encontraron materiales</p>
            <p className="text-text-secondary text-sm">Intenta ajustar los filtros o tus términos de búsqueda.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {materials.map((m: any) => (
                <Link
                  key={m.id}
                  to={`/materiales/${m.id}`}
                  className="group bg-surface rounded-xl border border-border-subtle p-6 hover:border-success/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono bg-base text-success px-3 py-1 rounded-lg border border-border-subtle font-semibold">
                        {m.sku}
                      </span>
                      {m.unidadMedida && (
                        <span className="text-xs bg-info-bg text-info px-2.5 py-1 rounded-lg font-semibold border border-info/20">
                          {m.unidadMedida.simbolo}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-text-primary text-lg mb-2 group-hover:text-success transition-colors">
                      {m.nombre}
                    </h3>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                      {m.descripcion || 'Sin descripción disponible'}
                    </p>
                  </div>

                  {m.categoria && (
                    <div>
                      <span className="inline-block text-xs bg-success-bg text-success px-3 py-1 rounded-lg font-medium border border-success/20">
                        {m.categoria.nombre}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2.5 rounded-xl border border-border-subtle bg-surface text-text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-elevated transition-all"
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
                      <span key={`dots-${i}`} className="px-2 text-text-muted">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          page === p
                            ? 'bg-accent text-white border border-accent'
                            : 'bg-surface border border-border-subtle text-text-secondary hover:bg-elevated'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="p-2.5 rounded-xl border border-border-subtle bg-surface text-text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-elevated transition-all"
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
