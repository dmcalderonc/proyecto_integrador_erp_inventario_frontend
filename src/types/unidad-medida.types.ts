export interface UnidadMedida {
  id: number;
  nombre: string;
  simbolo: string;
  isActive: boolean;
}

export interface CreateUnidadMedidaDto {
  nombre: string;
  simbolo: string;
}
