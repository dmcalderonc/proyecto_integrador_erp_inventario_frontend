import api from './http';
import type { User, CreateUserDto } from '../types';

export interface UpdateUserResponse {
  user: User;
  token?: string;
}

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  create: (dto: CreateUserDto) => api.post('/users', dto),
  update: (id: string, dto: Partial<CreateUserDto>) =>
    api.patch<UpdateUserResponse>(`/users/${id}`, dto),
  updateBodegas: (id: string, bodegaIds: number[]) =>
    api.patch<{ user: User }>(`/users/${id}/bodegas`, { bodegaIds }),
  delete: (id: string) => api.delete(`/users/${id}`),
};
