import type { Proyecto } from './proyecto.types';
import type { User } from './user.types';

export type RequirementStatus = 'PENDIENTE' | 'APROBADO' | 'PARCIALMENTE_ATENDIDO' | 'ATENDIDO' | 'RECHAZADO';

export interface RequirementDetalle {
  materialId: number;
  cantidadSolicitada: number;
  cantidadDespachada?: number;
  estadoItem?: string;
}

export interface Requirement {
  id: number;
  proyectoId: string;
  usuarioSolicitanteId: string;
  fechaSolicitud: string;
  estado: RequirementStatus;
  detalles?: RequirementDetalle[];
  proyecto?: Proyecto;
  usuarioSolicitante?: User;
}

export interface CreateRequirementDto {
  proyectoId: string;
  detalles: { materialId: number; cantidadSolicitada: number }[];
}
