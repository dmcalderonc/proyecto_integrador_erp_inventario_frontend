import { useCategorias } from './useCategorias';
import { categoriasApi } from '../api/categorias.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

vi.mock('../api/categorias.api');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockInvalidateQueries = vi.fn();

const mockData = [
  { id: 1, nombre: 'Electrónica' },
  { id: 2, nombre: 'Herramientas' },
];

describe('useCategorias', () => {
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

  test('fetch categorías con includeSuspended = false por defecto', () => {
    useCategorias();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['categorias', false] }),
    );
  });

  test('queryFn llama a categoriasApi.getAll(false)', async () => {
    useCategorias();

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (categoriasApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    const result = await queryFn();

    expect(categoriasApi.getAll).toHaveBeenCalledWith(false);
    expect(result).toEqual(mockData);
  });

  test('queryFn con includeSuspended = true', async () => {
    useCategorias(true);

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (categoriasApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    await queryFn();

    expect(categoriasApi.getAll).toHaveBeenCalledWith(true);
  });

  test('crear: mutationFn llama a categoriasApi.create', async () => {
    useCategorias();

    const crearConfig = mutationConfigs[0];
    (categoriasApi.create as vi.Mock).mockResolvedValue({ data: { id: 3 } });
    await crearConfig.mutationFn({ nombre: 'Nueva' });

    expect(categoriasApi.create).toHaveBeenCalledWith({ nombre: 'Nueva' });
  });

  test('crear: onSuccess invalida queries y muestra toast', () => {
    useCategorias();
    mutationConfigs[0].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['categorias'] });
    expect(toast.success).toHaveBeenCalledWith('Categoría creada exitosamente');
  });

  test('actualizar: mutationFn llama a categoriasApi.update', async () => {
    useCategorias();

    const actualizarConfig = mutationConfigs[1];
    (categoriasApi.update as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await actualizarConfig.mutationFn({ id: 1, dto: { nombre: 'Mod' } });

    expect(categoriasApi.update).toHaveBeenCalledWith(1, { nombre: 'Mod' });
  });

  test('actualizar: onSuccess invalida queries y muestra toast', () => {
    useCategorias();
    mutationConfigs[1].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['categorias'] });
    expect(toast.success).toHaveBeenCalledWith('Categoría actualizada exitosamente');
  });

  test('eliminar: mutationFn llama a categoriasApi.delete', async () => {
    useCategorias();

    const eliminarConfig = mutationConfigs[2];
    (categoriasApi.delete as vi.Mock).mockResolvedValue({ data: {} });
    await eliminarConfig.mutationFn(1);

    expect(categoriasApi.delete).toHaveBeenCalledWith(1);
  });

  test('eliminar: onSuccess invalida queries y muestra toast', () => {
    useCategorias();
    mutationConfigs[2].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['categorias'] });
    expect(toast.success).toHaveBeenCalledWith('Categoría eliminada exitosamente');
  });

  test('error en crear muestra toast.error con message', () => {
    useCategorias();
    mutationConfigs[0].onError({ response: { data: { message: 'Duplicada' } } });

    expect(toast.error).toHaveBeenCalledWith('Duplicada');
  });

  test('error en crear sin message usa default', () => {
    useCategorias();
    mutationConfigs[0].onError({ response: { data: {} } });

    expect(toast.error).toHaveBeenCalledWith('Error al crear categoría');
  });

  test('retorna categorías vacío cuando data es undefined', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true } as any);

    const { categorias } = useCategorias();
    expect(categorias).toEqual([]);
  });

  test('retorna las 3 mutaciones', () => {
    const result = useCategorias();
    expect(result.crear).toBeDefined();
    expect(result.actualizar).toBeDefined();
    expect(result.eliminar).toBeDefined();
  });
});
