export type TipoMovimiento = 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA';

export interface MovimientoDetalle {
  materialId: string;
  cantidad: number;
}

export interface CreateMovimientoDto {
  tipo: TipoMovimiento;
  observaciones?: string;
  bodegaOrigenId?: number;
  bodegaDestinoId?: number;
  detalles: MovimientoDetalle[];
}

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  fecha: string;
  observaciones?: string;
  estado: string;
  bodegaOrigenId?: number;
  bodegaDestinoId?: number;
  usuarioId: string;
}
