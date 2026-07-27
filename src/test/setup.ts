import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock global de TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn()
  })),
  keepPreviousData: 'KEEP_PREVIOUS_DATA',
}));

// Mock de AuthContext
// IMPORTANTE: Asegúrate de que tu archivo de contexto realmente exista 
// en 'src/contexts/AuthContext' (o ajústalo si tu carpeta se llama 'context' en singular)
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', rol: 'ADMIN', nombre: 'Test User', bodegaIds: [1] },
    hasRole: (roles: string[]) => true,
    hasAnyRole: (roles: string[]) => true,
    logout: vi.fn()
  }))
}));