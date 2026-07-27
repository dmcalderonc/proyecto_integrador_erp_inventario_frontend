import { useCompras } from './useCompras';
import { comprasApi } from '../api/compras.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

vi.mock('../api/compras.api');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockInvalidateQueries = vi.fn();

const mockData = [
  { id: 1, codigo: 'OC-001', estado: 'PENDIENTE', total: 500 },
];

describe('useCompras', () => {
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

  test('fetch compras con queryKey correcto', () => {
    useCompras();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['compras'] }),
    );
  });

  test('queryFn llama a comprasApi.getAll', async () => {
    useCompras();

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (comprasApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    const result = await queryFn();

    expect(comprasApi.getAll).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test('retorna compras del query', () => {
    const { compras } = useCompras();
    expect(compras).toEqual(mockData);
  });

  test('crear: mutationFn llama a comprasApi.create', async () => {
    useCompras();

    const crearConfig = mutationConfigs[0];
    const dto = { proveedorId: 1, detalles: [{ materialId: 1, cantidad: 10, precioUnitario: 5 }] };
    (comprasApi.create as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await crearConfig.mutationFn(dto);

    expect(comprasApi.create).toHaveBeenCalledWith(dto);
  });

  test('crear: onSuccess invalida queries y muestra toast', () => {
    useCompras();
    mutationConfigs[0].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['compras'] });
    expect(toast.success).toHaveBeenCalledWith('Compra creada exitosamente');
  });

  test('actualizar: mutationFn llama a comprasApi.update', async () => {
    useCompras();

    const actualizarConfig = mutationConfigs[1];
    (comprasApi.update as vi.Mock).mockResolvedValue({ data: {} });
    await actualizarConfig.mutationFn({ id: 1, dto: { total: 600 } });

    expect(comprasApi.update).toHaveBeenCalledWith(1, { total: 600 });
  });

  test('actualizar: onSuccess invalida queries y muestra toast', () => {
    useCompras();
    mutationConfigs[1].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['compras'] });
    expect(toast.success).toHaveBeenCalledWith('Compra actualizada exitosamente');
  });

  test('eliminar: mutationFn llama a comprasApi.delete', async () => {
    useCompras();

    const eliminarConfig = mutationConfigs[2];
    (comprasApi.delete as vi.Mock).mockResolvedValue({ data: {} });
    await eliminarConfig.mutationFn(1);

    expect(comprasApi.delete).toHaveBeenCalledWith(1);
  });

  test('eliminar: onSuccess invalida queries y muestra toast', () => {
    useCompras();
    mutationConfigs[2].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['compras'] });
    expect(toast.success).toHaveBeenCalledWith('Compra eliminada exitosamente');
  });

  test('aprobar: mutationFn llama a comprasApi.aprobar', async () => {
    useCompras();

    const aprobarConfig = mutationConfigs[3];
    (comprasApi.aprobar as vi.Mock).mockResolvedValue({ data: {} });
    await aprobarConfig.mutationFn(1);

    expect(comprasApi.aprobar).toHaveBeenCalledWith(1);
  });

  test('aprobar: onSuccess invalida queries y muestra toast', () => {
    useCompras();
    mutationConfigs[3].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['compras'] });
    expect(toast.success).toHaveBeenCalledWith('Compra aprobada exitosamente');
  });

  test('recibir: mutationFn llama a comprasApi.recibir', async () => {
    useCompras();

    const recibirConfig = mutationConfigs[4];
    (comprasApi.recibir as vi.Mock).mockResolvedValue({ data: {} });
    await recibirConfig.mutationFn(1);

    expect(comprasApi.recibir).toHaveBeenCalledWith(1);
  });

  test('recibir: onSuccess invalida queries y muestra toast', () => {
    useCompras();
    mutationConfigs[4].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['compras'] });
    expect(toast.success).toHaveBeenCalledWith('Compra recibida exitosamente');
  });

  test('error en crear muestra toast.error con message', () => {
    useCompras();
    mutationConfigs[0].onError({ response: { data: { message: 'Proveedor inválido' } } });

    expect(toast.error).toHaveBeenCalledWith('Proveedor inválido');
  });

  test('error en crear sin message usa default', () => {
    useCompras();
    mutationConfigs[0].onError({ response: { data: {} } });

    expect(toast.error).toHaveBeenCalledWith('Error al crear compra');
  });

  test('retorna las 5 mutaciones', () => {
    const result = useCompras();
    expect(result.crear).toBeDefined();
    expect(result.actualizar).toBeDefined();
    expect(result.eliminar).toBeDefined();
    expect(result.aprobar).toBeDefined();
    expect(result.recibir).toBeDefined();
  });
});
