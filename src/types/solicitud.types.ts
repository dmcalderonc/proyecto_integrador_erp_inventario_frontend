import type { Material } from './material.types';
import type { Proyecto } from './proyecto.types';
import type { User } from './user.types';
import type { Cotizacion } from './cotizacion.types';

export type EstadoSolicitud = 'PENDIENTE' | 'COTIZANDO' | 'APROBADA' | 'RECHAZADA';
export type NivelPrioridad = 'ALTA' | 'MEDIA' | 'BAJA';

export interface DetalleSolicitud {
  id?: number;
  solicitudId?: number;
  materialId: number;
  cantidadRequerida: number;
  material?: Material;
}

export interface SolicitudCompra {
  id: number;
  codigo: string;
  proyectoId: string;
  usuarioSolicitanteId: string;
  fechaSolicitud: string;
  estado: EstadoSolicitud;
  nivelPrioridad: NivelPrioridad;
  detalles?: DetalleSolicitud[];
  cotizaciones?: Cotizacion[];
  proyecto?: Proyecto;
  usuarioSolicitante?: User;
}

export interface UpdateSolicitudDto {
  estado?: EstadoSolicitud;
  nivelPrioridad?: NivelPrioridad;
}
