export interface DetalleAjuste {
  materialId: number;
  stockFisico: number;
}

export interface CreateAjusteDto {
  bodegaId: number;
  motivo: string;
  detalles: DetalleAjuste[];
}
