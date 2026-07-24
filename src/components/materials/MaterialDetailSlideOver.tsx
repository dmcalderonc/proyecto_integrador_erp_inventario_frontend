import { SlideOver } from '../ui/SlideOver';
import { useStockPorBodega } from '../../hooks/useStockPorBodega';
import { Package } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MaterialDetailSlideOverProps {
  materialId: number | null;
  materialNombre: string;
  materialSku: string;
  materialImagen?: string;
  materialCategoria?: string;
  materialUnidad?: string;
  materialDescripcion?: string;
  open: boolean;
  onClose: () => void;
}

export function MaterialDetailSlideOver({
  materialId,
  materialNombre,
  materialSku,
  materialImagen,
  materialCategoria,
  materialUnidad,
  materialDescripcion,
  open,
  onClose,
}: MaterialDetailSlideOverProps) {
  const { stockPorBodega, isLoading, totalDisponible, totalReservado } = useStockPorBodega(materialId);

  return (
    <SlideOver open={open} onClose={onClose} title="Detalle del Material">
      <div className="space-y-6">
        {/* Header: Imagen + Info */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-base border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
            {materialImagen ? (
              <img src={materialImagen} alt={materialNombre} className="max-w-full max-h-full object-contain" />
            ) : (
              <Package size={24} className="text-text-muted/40" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text-primary truncate">{materialNombre}</h3>
            <span className="inline-block mt-1 font-mono text-xs bg-success-bg text-success px-2.5 py-1 rounded-lg border border-success/20 font-semibold">
              {materialSku}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {materialCategoria && (
            <div className="bg-elevated rounded-xl p-3 border border-border-subtle">
              <p className="text-xs text-text-muted mb-1">Categoría</p>
              <p className="text-sm font-semibold text-accent">{materialCategoria}</p>
            </div>
          )}
          {materialUnidad && (
            <div className="bg-elevated rounded-xl p-3 border border-border-subtle">
              <p className="text-xs text-text-muted mb-1">Unidad</p>
              <p className="text-sm font-semibold text-text-primary">{materialUnidad}</p>
            </div>
          )}
        </div>

        {materialDescripcion && (
          <div className="bg-elevated rounded-xl p-3 border border-border-subtle">
            <p className="text-xs text-text-muted mb-1">Descripción</p>
            <p className="text-sm text-text-secondary">{materialDescripcion}</p>
          </div>
        )}

        {/* Stock por Bodega */}
        <div>
          <h4 className="text-sm font-bold text-text-primary mb-3">Stock por Bodega</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-elevated rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stockPorBodega.length === 0 ? (
            <div className="bg-elevated rounded-xl p-6 border border-border-subtle text-center">
              <Package size={20} className="text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">Sin stock registrado en bodegas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stockPorBodega.map((stock) => (
                <div key={stock.bodegaId} className="bg-elevated rounded-xl p-3 border border-border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{stock.bodegaNombre}</p>
                      <p className="text-xs text-text-muted">{stock.ubicacion}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-xs text-text-muted mb-0.5">Disponible</p>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-lg font-bold text-xs border",
                        stock.cantidad_disponible === 0
                          ? "bg-danger-bg text-danger border-danger/30"
                          : "bg-success-bg text-success border-success/30"
                      )}>
                        {stock.cantidad_disponible}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-text-muted mb-0.5">Reservado</p>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-lg font-bold text-xs border",
                        stock.cantidad_reservada > 0
                          ? "bg-warning-bg text-warning border-warning/30"
                          : "bg-elevated text-text-muted border-border-subtle"
                      )}>
                        {stock.cantidad_reservada}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-text-muted mb-0.5">Efectivo</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg font-bold text-xs bg-accent/10 text-accent border border-accent/20">
                        {stock.efectivo}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totales */}
        {stockPorBodega.length > 0 && (
          <div className="bg-surface rounded-xl p-4 border border-accent/20">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Totales Globales</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-success">{totalDisponible}</p>
                <p className="text-xs text-text-muted">Disponible</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{totalReservado}</p>
                <p className="text-xs text-text-muted">Reservado</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{totalDisponible - totalReservado}</p>
                <p className="text-xs text-text-muted">Efectivo</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SlideOver>
  );
}
