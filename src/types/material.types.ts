import type { Categoria } from './categoria.types';
import type { UnidadMedida } from './unidad-medida.types';

export interface Material {
  id: number;
  nombre: string;
  descripcion?: string;
  sku: string;
  imagen?: string;
  unidadMedida?: UnidadMedida;
  categoria_id?: number;
  categoria?: Categoria;
  stockDisponible?: number;
  stockReservado?: number;
}

export interface CreateMaterialDto {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  unidad_medida_id: number;
  categoria_id: number;
}
