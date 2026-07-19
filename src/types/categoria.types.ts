export interface Categoria {
  id: number;
  nombre: string;
  prefijo: string;
}

export interface CreateCategoriaDto {
  nombre: string;
  prefijo: string;
}
