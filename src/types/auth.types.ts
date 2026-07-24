// src/types/auth.types.ts

export type UserRole = 'ADMIN' | 'SOLICITANTE' | 'BODEGUERO' | 'COMPRADOR';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  estado: boolean;
  isActive?: boolean;
  bodegaIds?: number[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string; // En caso de que manejes rotación de tokens
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
    user: {
      id: string;
      nombre: string;
      email: string;
      rol: UserRole;
      fotoPerfil?: string;
      googleId?: string;
      avatarUrl?: string;
    };
  };
}