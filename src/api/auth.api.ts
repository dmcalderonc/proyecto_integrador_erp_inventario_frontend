import api from './http';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  login: (credentials: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', credentials),

  unlinkGoogle: () =>
    api.delete('/auth/google'),
};
