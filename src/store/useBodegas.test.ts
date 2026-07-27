import { useBodegas } from './useBodegas';
import { bodegasApi } from '../api/bodegas.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

vi.mock('../api/bodegas.api');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockInvalidateQueries = vi.fn();

const mockData = [
  { id: 1, nombre: 'Bodega Central' },
  { id: 2, nombre: 'Bodega Sur' },
];

describe('useBodegas', () => {
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

  test('fetch bodegas con includeSuspended = false por defecto', () => {
    useBodegas();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['bodegas', false] }),
    );
  });

  test('queryFn llama a bodegasApi.getAll(false)', async () => {
    useBodegas();

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (bodegasApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    const result = await queryFn();

    expect(bodegasApi.getAll).toHaveBeenCalledWith(false);
    expect(result).toEqual(mockData);
  });

  test('queryFn con includeSuspended = true', async () => {
    useBodegas(true);

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (bodegasApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    await queryFn();

    expect(bodegasApi.getAll).toHaveBeenCalledWith(true);
  });

  test('crear: mutationFn llama a bodegasApi.create', async () => {
    useBodegas();

    const crearConfig = mutationConfigs[0];
    (bodegasApi.create as vi.Mock).mockResolvedValue({ data: { id: 3 } });
    await crearConfig.mutationFn({ nombre: 'Nueva Bodega' });

    expect(bodegasApi.create).toHaveBeenCalledWith({ nombre: 'Nueva Bodega' });
  });

  test('crear: onSuccess invalida queries y muestra toast', () => {
    useBodegas();
    mutationConfigs[0].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['bodegas'] });
    expect(toast.success).toHaveBeenCalledWith('Bodega creada exitosamente');
  });

  test('actualizar: mutationFn llama a bodegasApi.update', async () => {
    useBodegas();

    const actualizarConfig = mutationConfigs[1];
    (bodegasApi.update as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await actualizarConfig.mutationFn({ id: 1, dto: { nombre: 'Mod' } });

    expect(bodegasApi.update).toHaveBeenCalledWith(1, { nombre: 'Mod' });
  });

  test('actualizar: onSuccess invalida queries y muestra toast', () => {
    useBodegas();
    mutationConfigs[1].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['bodegas'] });
    expect(toast.success).toHaveBeenCalledWith('Bodega actualizada exitosamente');
  });

  test('eliminar: mutationFn llama a bodegasApi.delete', async () => {
    useBodegas();

    const eliminarConfig = mutationConfigs[2];
    (bodegasApi.delete as vi.Mock).mockResolvedValue({ data: {} });
    await eliminarConfig.mutationFn(1);

    expect(bodegasApi.delete).toHaveBeenCalledWith(1);
  });

  test('eliminar: onSuccess invalida queries y muestra toast', () => {
    useBodegas();
    mutationConfigs[2].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['bodegas'] });
    expect(toast.success).toHaveBeenCalledWith('Bodega eliminada exitosamente');
  });

  test('error en crear muestra toast.error con message', () => {
    useBodegas();
    mutationConfigs[0].onError({ response: { data: { message: 'Duplicada' } } });

    expect(toast.error).toHaveBeenCalledWith('Duplicada');
  });

  test('error en crear sin message usa default', () => {
    useBodegas();
    mutationConfigs[0].onError({ response: { data: {} } });

    expect(toast.error).toHaveBeenCalledWith('Error al crear bodega');
  });

  test('retorna bodegas vacío cuando data es undefined', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true } as any);

    const { bodegas } = useBodegas();
    expect(bodegas).toEqual([]);
  });

  test('retorna las 3 mutaciones', () => {
    const result = useBodegas();
    expect(result.crear).toBeDefined();
    expect(result.actualizar).toBeDefined();
    expect(result.eliminar).toBeDefined();
  });
});
