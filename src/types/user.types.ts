import type { UserRole } from './auth.types';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  estado: boolean;
  isActive: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  fotoPerfil?: string;
  googleId?: string;
  avatarUrl?: string;
  bodegasAsignadas?: BodegaRef[];
  bodegaIds?: number[];
}

export interface BodegaRef {
  id: number;
  nombre: string;
  ubicacion?: string;
}

export interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  bodegaIds?: number[];
}
