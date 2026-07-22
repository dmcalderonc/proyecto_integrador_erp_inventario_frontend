import React from 'react';
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
    <div className="min-h-screen bg-base text-text-secondary flex flex-col justify-between">
      <Navbar />

      <div className="relative z-10 flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link
          to="/materiales"
          className="inline-flex items-center gap-2 text-sm text-accent hover:text-success transition-colors mb-6 font-medium"
        >
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>

        {isLoading ? (
          <div className="bg-surface rounded-xl border border-border-subtle p-8 animate-pulse">
            <div className="h-8 bg-elevated rounded-lg w-1/3 mb-4" />
            <div className="h-4 bg-elevated rounded-lg w-1/2 mb-3" />
            <div className="h-4 bg-elevated rounded-lg w-2/3" />
          </div>
        ) : isError || !material || (material as any).statusCode ? (
          <div className="bg-surface rounded-xl border border-border-subtle p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-elevated border border-border-subtle mb-4 text-text-muted">
              <Package size={36} />
            </div>
            <p className="text-text-primary font-bold text-xl mb-1">Material no encontrado</p>
            <p className="text-text-secondary text-sm mb-6">El producto que buscas no existe o fue retirado del sistema.</p>
            <Link
              to="/materiales"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-elevated text-text-primary font-semibold text-sm rounded-xl border border-border-subtle hover:bg-surface transition-all"
            >
              Volver al catálogo
            </Link>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border-subtle p-6 sm:p-10 animate-fade-in">
            {(material as any).imagen && (
              <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-8 bg-base border border-border-subtle">
                <img src={(material as any).imagen} alt={material.nombre} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs font-mono bg-base text-success px-3.5 py-1.5 rounded-lg border border-border-subtle font-semibold">
                SKU: {material.sku}
              </span>
              {material.unidadMedida && (
                <span className="text-xs bg-info-bg text-info px-3.5 py-1.5 rounded-lg border border-info/20 font-semibold">
                  {material.unidadMedida.nombre} ({material.unidadMedida.simbolo})
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">{material.nombre}</h1>

            {material.descripcion && (
              <p className="text-text-secondary text-base leading-relaxed mb-8">{material.descripcion}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border-subtle">
              {material.categoria && (
                <div className="flex items-center gap-3.5 p-4 bg-base rounded-xl border border-border-subtle">
                  <div className="w-10 h-10 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
                    <Tag size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Categoría</p>
                    <p className="font-semibold text-text-primary">{material.categoria.nombre}</p>
                  </div>
                </div>
              )}
              {material.unidadMedida && (
                <div className="flex items-center gap-3.5 p-4 bg-base rounded-xl border border-border-subtle">
                  <div className="w-10 h-10 rounded-lg bg-info-bg border border-info/20 flex items-center justify-center text-info">
                    <Ruler size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Unidad de Medida</p>
                    <p className="font-semibold text-text-primary">{material.unidadMedida.nombre}</p>
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
