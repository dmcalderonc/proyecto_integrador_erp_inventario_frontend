import { AlertTriangle, TrendingUp, TrendingDown, Minus, CalendarClock, Layers } from 'lucide-react';
import type { PrevisionMaterial } from '../../types/prevision.types';
import { badgeStyles } from '../../lib/design-tokens';
import { chipDeNivel, textoDiasRestantes } from '../../pages/private/PrevisionPage.logic';
import { cn } from '../../lib/utils';

interface Props {
  material: PrevisionMaterial;
}

/** Tarjeta individual de material en riesgo. */
export function QuiebreCard({ material }: Props) {
  const estilo = badgeStyles[chipDeNivel(material.nivel)] ?? badgeStyles.PENDIENTE;
  const IconoTendencia = material.tendencia === 'SUBE' ? TrendingUp
    : material.tendencia === 'BAJA' ? TrendingDown
    : Minus;

  const dias = textoDiasRestantes(material.diasHastaAgotar);

  return (
    <article className="rounded-xl border border-border-subtle bg-elevated p-4 space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{material.nombre}</p>
          <p className="text-xs text-text-muted truncate">
            {material.sku}
            {material.bodegaNombre ? ` · ${material.bodegaNombre}` : ''}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
            estilo.bg, estilo.text, estilo.border,
          )}
        >
          {material.nivel === 'AGOTADO' ? <AlertTriangle size={11} /> : null}
          {material.nivel}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-base px-3 py-2">
          <p className="text-text-muted flex items-center gap-1">
            <CalendarClock size={12} /> Días restantes
          </p>
          <p className={cn(
            'mt-0.5 text-sm font-semibold',
            material.diasHastaAgotar !== null && material.diasHastaAgotar < 7
              ? 'text-danger'
              : 'text-text-primary',
          )}>
            {dias}
          </p>
        </div>
        <div className="rounded-lg bg-base px-3 py-2">
          <p className="text-text-muted flex items-center gap-1">
            <Layers size={12} /> Stock efectivo
          </p>
          <p className="mt-0.5 text-sm font-semibold text-text-primary">
            {material.stockEfectivo} {material.unidad ?? ''}
          </p>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-2 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1">
          <IconoTendencia size={13} className={cn(
            material.tendencia === 'SUBE' && 'text-warning',
            material.tendencia === 'BAJA' && 'text-info',
          )} />
          {material.tendencia === 'SUBE' ? 'Demanda al alza' : material.tendencia === 'BAJA' ? 'Demanda a la baja' : 'Demanda estable'}
          {material.variacionPct !== null && material.variacionPct !== 0 ? (
            <span className="text-text-secondary">
              ({material.variacionPct > 0 ? '+' : ''}{material.variacionPct}%)
            </span>
          ) : null}
        </span>
        <span>{material.consumoPromedio} {material.unidad ?? ''}/día</span>
      </footer>

      {material.esAnomalo ? (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-[11px] text-danger">
          Consumo anómalo detectado{material.z !== null ? ` (z=${material.z})` : ''}.
        </p>
      ) : null}
    </article>
  );
}
