import api from './http';
import type { Requirement, CreateRequirementDto, RequirementStatus } from '../types';

export const requirementsApi = {
  getAll: () => api.get<Requirement[]>('/requirements'),
  getById: (id: number) => api.get<Requirement>(`/requirements/${id}`),
  create: (dto: CreateRequirementDto) => api.post<Requirement>('/requirements', dto),
  updateStatus: (id: number, dto: { estado: RequirementStatus }) =>
    api.patch<Requirement>(`/requirements/${id}/status`, dto),
  despachar: (id: number) =>
    api.patch<Requirement>(`/requirements/${id}/despachar`),
  delete: (id: number) => api.delete(`/requirements/${id}`),
  evaluarItem: (reqId: number, detalleId: number, accion: string) =>
    api.patch(`/requirements/${reqId}/evaluar-item/${detalleId}`, { accion }),
};