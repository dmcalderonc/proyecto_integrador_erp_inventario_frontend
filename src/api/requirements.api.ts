import api from './http';
import type { Requirement, CreateRequirementDto, RequirementStatus } from '../types';

export const requirementsApi = {
  getAll: () => api.get<Requirement[]>('/requirements'),
  getById: (id: number) => api.get<Requirement>(`/requirements/${id}`),
  create: (dto: CreateRequirementDto) => api.post<Requirement>('/requirements', dto),
  updateStatus: (id: number, dto: { estado: RequirementStatus }) =>
    api.patch<Requirement>(`/requirements/${id}/status`, dto),
  delete: (id: number) => api.delete(`/requirements/${id}`),
};