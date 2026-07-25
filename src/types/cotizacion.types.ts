import type { Proveedor } from './proveedor.types';
import type { Material } from './material.types';

export type EstadoCotizacion = 'EN_EVALUACION' | 'ELEGIDA' | 'DESCARTADA';

export interface Cotizacion {
  id: number;
  requerimientoDetalleId: number | null;
  proveedorId: number;
  cantidad: number;
  precioUnitario: number;
  tiempoEntregaDias: number | null;
  marca: string | null;
  observaciones: string | null;
  archivoRespaldoUrl?: string;
  solicitudCompraId?: number | null;
  estado: EstadoCotizacion;
  proveedor?: Proveedor;
  requerimientoDetalle?: {
    id: number;
    materialId: number;
    cantidadSolicitada: number;
    material?: Material;
  };
}

export interface CreateCotizacionDto {
  requerimientoDetalleId: number;
  proveedorId: number;
  cantidad: number;
  precioUnitario: number;
  tiempoEntregaDias?: number;
  marca?: string;
  observaciones?: string;
  archivoRespaldoUrl?: string;
  solicitudCompraId?: number;
}
