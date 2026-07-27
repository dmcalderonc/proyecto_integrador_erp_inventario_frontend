import { useMateriales } from './useMateriales';
import { materialesApi } from '../api/materiales.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

vi.mock('../api/materiales.api');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockInvalidateQueries = vi.fn();

const mockMateriales = [
  { id: 1, nombre: 'Disco SSD', sku: 'SSD-001' },
  { id: 2, nombre: 'RAM 8GB', sku: 'RAM-008' },
];

const mockResponse = {
  data: mockMateriales,
  meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
};

describe('useMateriales', () => {
  let mutationConfigs: any[];

  beforeEach(() => {
    vi.clearAllMocks();
    mutationConfigs = [];

    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as any);

    mockUseQuery.mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isFetching: false,
    } as any);

    mockUseMutation.mockImplementation((config: any) => {
      mutationConfigs.push(config);
      return { mutateAsync: vi.fn(), isPending: false } as any;
    });
  });

  test('fetch materiales con parámetros de paginación', () => {
    useMateriales({ page: 1, limit: 20 });

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['materiales', 1, 20, undefined, undefined, undefined, undefined, undefined],
      }),
    );
  });

  test('fetch con todos los params', () => {
    useMateriales({
      page: 2,
      limit: 5,
      search: 'disco',
      sort: 'nombre',
      order: 'asc',
      categoriaId: 3,
      bodegaId: 7,
    });

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['materiales', 2, 5, 'disco', 'nombre', 'asc', 3, 7],
      }),
    );
  });

  test('queryFn llama a materialesApi.getAll', async () => {
    useMateriales({ page: 1, limit: 10 });

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (materialesApi.getAll as vi.Mock).mockResolvedValue(mockResponse);
    const result = await queryFn();

    expect(materialesApi.getAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result).toEqual(mockResponse);
  });

  test('retorna materiales y meta correctamente', () => {
    const result = useMateriales();

    expect(result.materiales).toEqual(mockMateriales);
    expect(result.meta).toEqual(mockResponse.meta);
  });

  test('retorna materiales vacío cuando data es undefined', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    } as any);

    const { materiales, meta } = useMateriales();
    expect(materiales).toEqual([]);
    expect(meta).toBeUndefined();
  });

  test('isLoading combina isLoading e isFetching', () => {
    mockUseQuery.mockReturnValue({
      data: mockResponse,
      isLoading: false,
      isFetching: true,
    } as any);

    const { isLoading } = useMateriales();
    expect(isLoading).toBe(true);
  });

  test('crear: mutationFn llama a materialesApi.create', async () => {
    useMateriales();

    const crearConfig = mutationConfigs[0];
    (materialesApi.create as vi.Mock).mockResolvedValue({ data: { id: 3 } });
    const dto = { nombre: 'Nuevo', descripcion: '', unidad_medida_id: 1, categoria_id: 1 };
    await crearConfig.mutationFn(dto);

    expect(materialesApi.create).toHaveBeenCalledWith(dto);
  });

  test('crear: onSuccess invalida queries y muestra toast', () => {
    useMateriales();
    mutationConfigs[0].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['materiales'] });
    expect(toast.success).toHaveBeenCalledWith('Material creado exitosamente');
  });

  test('actualizar: mutationFn llama a materialesApi.update', async () => {
    useMateriales();

    const actualizarConfig = mutationConfigs[1];
    (materialesApi.update as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await actualizarConfig.mutationFn({ id: 1, dto: { nombre: 'Mod' } });

    expect(materialesApi.update).toHaveBeenCalledWith(1, { nombre: 'Mod' });
  });

  test('actualizar: onSuccess invalida queries y muestra toast', () => {
    useMateriales();
    mutationConfigs[1].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['materiales'] });
    expect(toast.success).toHaveBeenCalledWith('Material actualizado exitosamente');
  });

  test('eliminar: mutationFn llama a materialesApi.delete', async () => {
    useMateriales();

    const eliminarConfig = mutationConfigs[2];
    (materialesApi.delete as vi.Mock).mockResolvedValue({ data: {} });
    await eliminarConfig.mutationFn(5);

    expect(materialesApi.delete).toHaveBeenCalledWith(5);
  });

  test('eliminar: onSuccess invalida queries y muestra toast', () => {
    useMateriales();
    mutationConfigs[2].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['materiales'] });
    expect(toast.success).toHaveBeenCalledWith('Material eliminado exitosamente');
  });

  test('error en crear muestra toast.error', () => {
    useMateriales();
    mutationConfigs[0].onError({ response: { data: { message: 'SKU duplicado' } } });

    expect(toast.error).toHaveBeenCalledWith('SKU duplicado');
  });

  test('error en crear sin message usa default', () => {
    useMateriales();
    mutationConfigs[0].onError({ response: { data: {} } });

    expect(toast.error).toHaveBeenCalledWith('Error al crear material');
  });

  test('retorna las 3 mutaciones', () => {
    const result = useMateriales();
    expect(result.crear).toBeDefined();
    expect(result.actualizar).toBeDefined();
    expect(result.eliminar).toBeDefined();
  });
});
