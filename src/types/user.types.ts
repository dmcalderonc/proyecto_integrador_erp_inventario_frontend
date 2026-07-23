import type { UserRole } from './auth.types';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  estado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  fotoPerfil?: string;
  googleId?: string;
  avatarUrl?: string;
}

export interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
}
