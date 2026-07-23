import api from './http';

export const traspasosApi = {
  getAll: (params?: { estado?: string; bodegaOrigenId?: number; bodegaDestinoId?: number }) =>
    api.get('/traspasos', { params }),

  getById: (id: number) =>
    api.get(`/traspasos/${id}`),

  create: (dto: any) =>
    api.post('/traspasos', dto),

  enviar: (id: number) =>
    api.patch(`/traspasos/${id}/enviar`),

  recibir: (id: number) =>
    api.patch(`/traspasos/${id}/recibir`),

  cancelar: (id: number) =>
    api.patch(`/traspasos/${id}/cancelar`),
};
