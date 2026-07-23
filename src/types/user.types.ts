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
  bodegaAsignadaId?: number | null;
  bodegaAsignada?: { id: number; nombre: string } | null;
}

export interface CreateUserDto {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  bodegaAsignadaId?: number;
}
