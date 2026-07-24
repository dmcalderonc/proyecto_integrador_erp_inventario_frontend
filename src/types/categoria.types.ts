export interface Categoria {
  id: number;
  nombre: string;
  prefijo: string;
  isActive: boolean;
}

export interface CreateCategoriaDto {
  nombre: string;
  prefijo: string;
}
