export interface DetalleDespacho {
  materialId: number;
  cantidad: number;
}

export interface CreateEntregaDirectaDto {
  ordenCompraId: number;
  requerimientoId: number;
  proyectoId: string;
  detalles: DetalleDespacho[];
}

export interface DespachoResponse {
  mensaje: string;
}