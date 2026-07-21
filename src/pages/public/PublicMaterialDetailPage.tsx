import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, Tag, Ruler } from 'lucide-react';
import { publicMaterialesApi } from '../../api/public-materiales.api';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link to="/materiales" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : isError || !material || (material as any).statusCode ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Material no encontrado</p>
            <Link to="/materiales" className="text-sm text-blue-600 hover:underline mt-2 inline-block">Volver al catálogo</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {(material as any).imagen && (
              <div className="w-full h-64 rounded-lg overflow-hidden mb-6 bg-gray-100">
                <img src={(material as any).imagen} alt={material.nombre} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex flex-wrap items-start gap-3 mb-6">
              <span className="text-sm font-mono bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">{material.sku}</span>
              {material.unidadMedida && (
                <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium">
                  {material.unidadMedida.nombre} ({material.unidadMedida.simbolo})
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{material.nombre}</h1>

            {material.descripcion && (
              <p className="text-gray-600 leading-relaxed mb-6">{material.descripcion}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
              {material.categoria && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Tag size={20} className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Categoría</p>
                    <p className="font-medium text-gray-900">{material.categoria.nombre}</p>
                  </div>
                </div>
              )}
              {material.unidadMedida && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Ruler size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Unidad de Medida</p>
                    <p className="font-medium text-gray-900">{material.unidadMedida.nombre}</p>
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
