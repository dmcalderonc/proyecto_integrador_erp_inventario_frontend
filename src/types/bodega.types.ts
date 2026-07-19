export interface Bodega {
  id: number;
  nombre: string;
  ubicacion: string;
  isPrincipal: boolean;
  proyectoId?: string;
}

export interface CreateBodegaDto {
  nombre: string;
  ubicacion: string;
  isPrincipal?: boolean;
  proyectoId?: string;
}
