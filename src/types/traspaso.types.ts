export type EstadoTraspaso = 'PENDIENTE' | 'EN_TRANSITO' | 'RECIBIDO' | 'CANCELADO';

export interface DetalleTraspaso {
  id: number;
  materialId: number;
  cantidad: number;
  cantidadRecibida: number;
  material?: { id: number; nombre: string; sku: string };
}

export interface Traspaso {
  id: number;
  codigo: string;
  bodegaOrigenId: number;
  bodegaDestinoId: number;
  usuarioOrigenId: string;
  usuarioDestinoId?: string;
  estado: EstadoTraspaso;
  fechaCreacion: string;
  fechaEnvio?: string;
  fechaRecepcion?: string;
  observaciones?: string;
  requerimientoDetalleId?: number;
  autorizadoPorId?: string;
  fechaAutorizacion?: string;
  autorizadoPor?: { id: string; nombre: string; email: string };
  detalles: DetalleTraspaso[];
  bodegaOrigen?: { id: number; nombre: string; ubicacion: string };
  bodegaDestino?: { id: number; nombre: string; ubicacion: string };
  usuarioOrigen?: { id: string; nombre: string; email: string };
  usuarioDestino?: { id: string; nombre: string; email: string };
}

export interface CreateTraspasoDto {
  bodegaOrigenId: number;
  bodegaDestinoId: number;
  observaciones?: string;
  detalles: { materialId: number; cantidad: number }[];
}
