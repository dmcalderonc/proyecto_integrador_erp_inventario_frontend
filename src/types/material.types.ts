import type { Categoria } from './categoria.types';
import type { UnidadMedida } from './unidad-medida.types';

export interface Material {
  id: number;
  nombre: string;
  descripcion?: string;
  sku: string;
  unidadMedida?: UnidadMedida;
  categoria_id?: number;
  categoria?: Categoria;
}

export interface CreateMaterialDto {
  nombre: string;
  descripcion?: string;
  unidad_medida_id: number;
  categoria_id: number;
}
