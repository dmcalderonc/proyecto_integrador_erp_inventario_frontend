import type { Proveedor } from './proveedor.types';

export type EstadoOrden = 'BORRADOR' | 'EMITIDA' | 'RECIBIDA' | 'CANCELADA' | 'PENDIENTE';

export interface DetalleCompra {
  materialId: number;
  cantidad: number;
  precioUnitario: number;
  requerimientoDetalleId?: number;
}

export interface CreateCompraDto {
  proveedorId: number;
  fechaEmision?: string;
  subtotal?: number;
  impuestos?: number;
  total?: number;
  detalles?: DetalleCompra[];
}

export type CrearCompraDto = CreateCompraDto;

export interface OrdenCompra {
  id: number;
  codigo: string;
  fechaEmision: string;
  estado: EstadoOrden;
  subtotal: number;
  impuestos: number;
  total: number;
  proveedor?: Proveedor;
}
