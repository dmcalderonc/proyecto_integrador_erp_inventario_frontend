import type { Proveedor } from './proveedor.types';

export type EstadoOrden = 'BORRADOR' | 'EMITIDA' | 'RECIBIDA' | 'RECIBIDA_PARCIAL' | 'CANCELADA' | 'PENDIENTE';

export interface DetalleCompra {
  materialId: number;
  cantidad: number;
  precioUnitario: number;
  requerimientoDetalleId?: number;
}

export interface DetalleOrdenCompra {
  id: number;
  cantidad: number;
  precioUnitario: number;
  materialId: number;
  material?: { id: number; nombre: string; sku: string };
  requerimientoDetalleId?: number | null;
  cantidadRecibida?: number;
  justificativoRecepcion?: string | null;
  tiempoEntregaDias?: number | null;
  marca?: string | null;
  observaciones?: string | null;
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
  detalles?: DetalleOrdenCompra[];
  bodegaDestinoId?: number;
}
