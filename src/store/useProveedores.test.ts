import { useProveedores } from './useProveedores';
import { proveedoresApi } from '../api/proveedores.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

vi.mock('../api/proveedores.api');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockInvalidateQueries = vi.fn();

const mockData = [
  { id: 1, razon_social: 'Proveedor A' },
  { id: 2, razon_social: 'Proveedor B' },
];

describe('useProveedores', () => {
  let mutationConfigs: any[];

  beforeEach(() => {
    vi.clearAllMocks();
    mutationConfigs = [];

    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as any);

    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
    } as any);

    mockUseMutation.mockImplementation((config: any) => {
      mutationConfigs.push(config);
      return { mutateAsync: vi.fn(), isPending: false } as any;
    });
  });

  test('fetch proveedores con includeSuspended = false por defecto', () => {
    useProveedores();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['proveedores', false] }),
    );
    expect(mockUseQuery.mock.calls[0][0].queryFn).toBeDefined();
  });

  test('queryFn llama a proveedoresApi.getAll(false)', async () => {
    useProveedores();

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (proveedoresApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    const result = await queryFn();

    expect(proveedoresApi.getAll).toHaveBeenCalledWith(false);
    expect(result).toEqual(mockData);
  });

  test('queryFn con includeSuspended = true', async () => {
    useProveedores(true);

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (proveedoresApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    await queryFn();

    expect(proveedoresApi.getAll).toHaveBeenCalledWith(true);
  });

  test('useMutation crear: mutationFn llama a proveedoresApi.create', async () => {
    useProveedores();

    const crearConfig = mutationConfigs[0];
    (proveedoresApi.create as vi.Mock).mockResolvedValue({ data: { id: 3 } });
    const result = await crearConfig.mutationFn({ razon_social: 'Nuevo' });

    expect(proveedoresApi.create).toHaveBeenCalledWith({ razon_social: 'Nuevo' });
    expect(result).toEqual({ data: { id: 3 } });
  });

  test('useMutation crear: onSuccess invalida queries y muestra toast', () => {
    useProveedores();

    const crearConfig = mutationConfigs[0];
    crearConfig.onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['proveedores'] });
    expect(toast.success).toHaveBeenCalledWith('Proveedor creado exitosamente');
  });

  test('useMutation actualizar: mutationFn llama a proveedoresApi.update', async () => {
    useProveedores();

    const actualizarConfig = mutationConfigs[1];
    (proveedoresApi.update as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    const result = await actualizarConfig.mutationFn({ id: 1, dto: { razon_social: 'Mod' } });

    expect(proveedoresApi.update).toHaveBeenCalledWith(1, { razon_social: 'Mod' });
    expect(result).toEqual({ data: { id: 1 } });
  });

  test('useMutation actualizar: onSuccess invalida queries y muestra toast', () => {
    useProveedores();

    const actualizarConfig = mutationConfigs[1];
    actualizarConfig.onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['proveedores'] });
    expect(toast.success).toHaveBeenCalledWith('Proveedor actualizado exitosamente');
  });

  test('useMutation eliminar: mutationFn llama a proveedoresApi.delete', async () => {
    useProveedores();

    const eliminarConfig = mutationConfigs[2];
    (proveedoresApi.delete as vi.Mock).mockResolvedValue({ data: {} });
    const result = await eliminarConfig.mutationFn(1);

    expect(proveedoresApi.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ data: {} });
  });

  test('useMutation eliminar: onSuccess invalida queries y muestra toast', () => {
    useProveedores();

    const eliminarConfig = mutationConfigs[2];
    eliminarConfig.onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['proveedores'] });
    expect(toast.success).toHaveBeenCalledWith('Proveedor eliminado exitosamente');
  });

  test('useMutation crear: onError muestra toast.error con message', () => {
    useProveedores();

    const crearConfig = mutationConfigs[0];
    crearConfig.onError({ response: { data: { message: 'Error del servidor' } } });

    expect(toast.error).toHaveBeenCalledWith('Error del servidor');
  });

  test('useMutation crear: onError muestra toast.error por defecto', () => {
    useProveedores();

    const crearConfig = mutationConfigs[0];
    crearConfig.onError({ response: { data: {} } });

    expect(toast.error).toHaveBeenCalledWith('Error al crear proveedor');
  });

  test('retorna proveedores vacío cuando data es undefined', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { proveedores } = useProveedores();
    expect(proveedores).toEqual([]);
  });

  test('retorna isLoading del query', () => {
    mockUseQuery.mockReturnValue({
      data: mockData,
      isLoading: true,
    } as any);

    const { isLoading } = useProveedores();
    expect(isLoading).toBe(true);
  });

  test('retorna las 3 mutaciones', () => {
    const result = useProveedores();
    expect(result.crear).toBeDefined();
    expect(result.actualizar).toBeDefined();
    expect(result.eliminar).toBeDefined();
  });
});
