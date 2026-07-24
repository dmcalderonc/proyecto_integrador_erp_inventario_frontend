export interface Notification {
  _id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  entidad?: string;
  entidadId?: string;
  leida: boolean;
  rolDestino?: string;
  usuarioId?: string;
  createdAt: string;
  updatedAt: string;
}
