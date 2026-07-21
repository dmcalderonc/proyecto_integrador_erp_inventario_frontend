import { useState } from 'react';
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Catálogo de Materiales</h1>
        <p className="text-gray-500 mb-6">Explora nuestro inventario de materiales disponibles</p>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o descripción..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="nombre-ASC">Nombre (A-Z)</option>
            <option value="nombre-DESC">Nombre (Z-A)</option>
            <option value="sku-ASC">SKU (A-Z)</option>
            <option value="sku-DESC">SKU (Z-A)</option>
            <option value="categoria-ASC">Categoría (A-Z)</option>
          </select>
        </div>

        {meta && (
          <p className="text-sm text-gray-500 mb-4">
            {meta.total} resultado{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : materials.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No se encontraron materiales</p>
            <p className="text-sm text-gray-400 mt-1">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((m: any) => (
                <Link
                  key={m.id}
                  to={`/materiales/${m.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{m.sku}</span>
                    {m.unidadMedida && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium">{m.unidadMedida.simbolo}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{m.nombre}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{m.descripcion || 'Sin descripción'}</p>
                  {m.categoria && (
                    <span className="inline-block text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                      {m.categoria.nombre}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
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
                      <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
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
