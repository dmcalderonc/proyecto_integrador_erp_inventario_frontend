export type EstadoProyecto = 'ACTIVO' | 'CERRADO';

export interface Proyecto {
  id: string;
  nombre: string;
  codigoProyecto: string;
  fechaInicio: string;
  estado: EstadoProyecto;
}

export interface CreateProyectoDto {
  nombre: string;
  codigoProyecto?: string;
  fechaInicio: string;
  estado?: EstadoProyecto;
}
