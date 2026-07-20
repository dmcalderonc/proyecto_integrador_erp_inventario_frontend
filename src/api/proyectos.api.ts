import api from './http';
import type { Proyecto, CreateProyectoDto } from '../types';

export const proyectosApi = {
  getAll: () => api.get<Proyecto[]>('/proyectos'),
  getById: (id: string) => api.get<Proyecto>(`/proyectos/${id}`),
  create: (dto: CreateProyectoDto) => api.post<Proyecto>('/proyectos', dto),
  update: (id: string, dto: Partial<CreateProyectoDto>) => api.patch<Proyecto>(`/proyectos/${id}`, dto),
  delete: (id: string) => api.delete(`/proyectos/${id}`),
};