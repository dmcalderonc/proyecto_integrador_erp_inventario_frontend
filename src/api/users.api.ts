import api from './http';
import type { User, CreateUserDto } from '../types';

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  create: (dto: CreateUserDto) => api.post('/users', dto),
  update: (id: string, dto: Partial<CreateUserDto>) => api.patch(`/users/${id}`, dto),
  delete: (id: string) => api.delete(`/users/${id}`),
};
