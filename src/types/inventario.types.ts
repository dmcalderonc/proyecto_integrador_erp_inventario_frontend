import type { Material } from './material.types';
import type { Bodega } from './bodega.types';

export interface Inventario {
  id: number;
  material_id: number;
  bodega_id: number;
  cantidad_disponible: number;
  cantidad_reservada: number;
  material?: Material;
  bodega?: Bodega;
}
