import type { Material } from './material.types';
import type { Proyecto } from './proyecto.types';
import type { User } from './user.types';
import type { Bodega } from './bodega.types';

export type ItemStatus = 
  | 'PENDIENTE' 
  | 'APROBADO_BODEGA' 
  | 'RECHAZADO' 
  | 'EN_COMPRAS' 
  | 'EN_TRASLADO' 
  | 'DESPACHADO';

export type RequirementStatus = 
  | 'PENDIENTE' 
  | 'APROBADO' 
  | 'PARCIALMENTE_ATENDIDO' 
  | 'ATENDIDO' 
  | 'RECHAZADO' 
  | 'DESPACHADO';

export interface RequirementDetalle {
  id: number;
  materialId: number;
  cantidadSolicitada: number;
  cantidadDespachada?: number;
  estadoItem?: ItemStatus;
  material?: Material;
  observaciones?: string;
}

export interface Requirement {
  id: number;
  proyectoId: string;
  usuarioSolicitanteId: string;
  bodegaId: number;
  fechaSolicitud: string;
  estado: RequirementStatus;
  detalles?: RequirementDetalle[];
  proyecto?: Proyecto;
  usuarioSolicitante?: User;
  bodega?: Bodega;
}

export interface CreateRequirementDto {
  proyectoId: string;
  bodegaId: number;
  detalles: { materialId: number; cantidadSolicitada: number }[];
}
