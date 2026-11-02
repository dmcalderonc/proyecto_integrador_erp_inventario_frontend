import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NivelQuiebre, PrevisionMaterial, Tendencia } from '../../types/prevision.types';

const ORDEN_NIVEL: Record<NivelQuiebre, number> = {
  AGOTADO: 0,
  CRITICO: 1,
  RIESGO: 2,
  ESTABLE: 3,
  SIN_DATOS: 4,
};

/** Orden por urgencia: nivel → días asc (null al final) → stock asc → nombre. */
export function ordenarPorUrgencia(items: PrevisionMaterial[]): PrevisionMaterial[] {
  return [...items].sort((a, b) => {
    const porNivel = ORDEN_NIVEL[a.nivel] - ORDEN_NIVEL[b.nivel];
    if (porNivel !== 0) return porNivel;

    const diasA = a.diasHastaAgotar ?? Number.POSITIVE_INFINITY;
    const diasB = b.diasHastaAgotar ?? Number.POSITIVE_INFINITY;
    if (diasA !== diasB) return diasA - diasB;

    if (a.stockEfectivo !== b.stockEfectivo) return a.stockEfectivo - b.stockEfectivo;

    return a.nombre.localeCompare(b.nombre, 'es');
  });
}

/** Clave de `badgeStyles` para cada nivel de quiebre. */
export function chipDeNivel(nivel: NivelQuiebre): string {
  switch (nivel) {
    case 'AGOTADO':
      return 'RECHAZADO';
    case 'CRITICO':
      return 'ALTA';
    case 'RIESGO':
      return 'MEDIA';
    case 'ESTABLE':
      return 'ACTIVO';
    case 'SIN_DATOS':
      return 'PENDIENTE';
    default:
      return 'PENDIENTE';
  }
}

/** Texto legible para días restantes. */
export function textoDiasRestantes(dias: number | null | undefined): string {
  if (dias === null || dias === undefined) return 'sin estimación';
  if (dias <= 0) return 'agotado';
  if (dias === 1) return 'hoy';
  return `${dias} días`;
}

/** Icono según la tendencia de consumo. */
export function iconoDeTendencia(tendencia: Tendencia): LucideIcon {
  if (tendencia === 'SUBE') return TrendingUp;
  if (tendencia === 'BAJA') return TrendingDown;
  return Minus;
}

/** Los N materiales más urgentes. */
export function topUrgentes(items: PrevisionMaterial[], n: number): PrevisionMaterial[] {
  if (!Number.isFinite(n) || n <= 0) return [];
  return ordenarPorUrgencia(items).slice(0, n);
}
