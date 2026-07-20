export type TipoMovimiento = 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA';

export interface MovimientoDetalle {
  materialId: number | string;
  cantidad: number;
}

export interface CreateMovimientoDto {
  tipo: TipoMovimiento;
  observaciones?: string;
  bodegaOrigenId?: number;
  bodegaDestinoId?: number;
  detalles: MovimientoDetalle[];
}

export type CrearMovimientoDto = CreateMovimientoDto;

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  fecha: string;
  observaciones?: string;
  estado: string;
  bodegaOrigenId?: number;
  bodegaDestinoId?: number;
  bodegaOrigen?: { id: number; nombre: string };
  bodegaDestino?: { id: number; nombre: string };
  usuarioId: string;
}
