import type { Categoria } from './categoria.types';

export type UnidadMedida = 'U' | 'KG' | 'M' | 'M2';

export interface Material {
  id: number;
  nombre: string;
  descripcion?: string;
  sku: string;
  unidad_medida: UnidadMedida;
  categoria_id?: number;
  categoria?: Categoria;
}

export interface CreateMaterialDto {
  nombre: string;
  descripcion?: string;
  unidad_medida: UnidadMedida;
  categoria_id: number;
}
