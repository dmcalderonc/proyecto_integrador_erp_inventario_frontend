import type { Proveedor } from './proveedor.types';
import type { SolicitudCompra } from './solicitud.types';

export type EstadoCotizacion = 'EN_EVALUACION' | 'ELEGIDA' | 'DESCARTADA';

export interface Cotizacion {
  id: number;
  solicitudId: number;
  proveedorId: number;
  precioOfertadoTotal: number;
  archivoRespaldoUrl?: string;
  estado: EstadoCotizacion;
  solicitud?: SolicitudCompra;
  proveedor?: Proveedor;
}

export interface CreateCotizacionDto {
  solicitudId: number;
  proveedorId: number;
  precioOfertadoTotal: number;
  archivoRespaldoUrl?: string;
  estado?: EstadoCotizacion;
}
