export interface CotizacionRow {
  estado: string;
  cantidad: number;
}

export function tieneCotizacionActiva(cotizaciones: CotizacionRow[]): boolean {
  return cotizaciones.some(c => c.estado === 'EN_EVALUACION' || c.estado === 'ELEGIDA');
}

export function calcularCantidadRestante(
  cantidadSolicitada: number,
  cotizaciones: CotizacionRow[],
): number {
  const totalCotizado = cotizaciones
    .filter(c => c.estado !== 'DESCARTADA')
    .reduce((sum, c) => sum + c.cantidad, 0);
  return cantidadSolicitada - totalCotizado;
}

export function filtrarCotizaciones<T extends { estado: string }>(
  cotizaciones: T[],
  filtroEstado: string,
): T[] {
  if (!filtroEstado) return cotizaciones;
  return cotizaciones.filter(c => c.estado === filtroEstado);
}
