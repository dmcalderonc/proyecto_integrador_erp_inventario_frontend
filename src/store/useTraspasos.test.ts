import { useTraspasos } from './useTraspasos';
import { traspasosApi } from '../api/traspasos.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

vi.mock('../api/traspasos.api');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockInvalidateQueries = vi.fn();

const mockData = [
  { id: 1, codigo: 'TRP-001', estado: 'PENDIENTE', bodegaOrigenId: 1, bodegaDestinoId: 2 },
];

describe('useTraspasos', () => {
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

  test('fetch sin params', () => {
    useTraspasos();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['traspasos', undefined] }),
    );
  });

  test('queryFn sin params llama a getAll con undefined', async () => {
    useTraspasos();

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (traspasosApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    const result = await queryFn();

    expect(traspasosApi.getAll).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockData);
  });

  test('queryFn con filtro de estado', async () => {
    useTraspasos({ estado: 'EN_TRANSITO' });

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (traspasosApi.getAll as vi.Mock).mockResolvedValue({ data: [] });
    await queryFn();

    expect(traspasosApi.getAll).toHaveBeenCalledWith({ estado: 'EN_TRANSITO' });
  });

  test('queryFn con filtro de bodegas', async () => {
    useTraspasos({ bodegaOrigenId: 1, bodegaDestinoId: 2 });

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (traspasosApi.getAll as vi.Mock).mockResolvedValue({ data: [] });
    await queryFn();

    expect(traspasosApi.getAll).toHaveBeenCalledWith({
      bodegaOrigenId: 1,
      bodegaDestinoId: 2,
    });
  });

  test('enviar: mutationFn llama a traspasosApi.enviar', async () => {
    useTraspasos();

    const enviarConfig = mutationConfigs[0];
    (traspasosApi.enviar as vi.Mock).mockResolvedValue({ data: {} });
    await enviarConfig.mutationFn(1);

    expect(traspasosApi.enviar).toHaveBeenCalledWith(1);
  });

  test('enviar: onSuccess invalida queries y muestra toast', () => {
    useTraspasos();
    mutationConfigs[0].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['traspasos'] });
    expect(toast.success).toHaveBeenCalledWith('Envío confirmado correctamente');
  });

  test('recibir: mutationFn llama a traspasosApi.recibir', async () => {
    useTraspasos();

    const recibirConfig = mutationConfigs[1];
    (traspasosApi.recibir as vi.Mock).mockResolvedValue({ data: {} });
    await recibirConfig.mutationFn(1);

    expect(traspasosApi.recibir).toHaveBeenCalledWith(1);
  });

  test('recibir: onSuccess invalida traspasos e inventario', () => {
    useTraspasos();
    mutationConfigs[1].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['traspasos'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['inventario'] });
    expect(toast.success).toHaveBeenCalledWith('Recepción confirmada correctamente');
  });

  test('cancelar: mutationFn llama a traspasosApi.cancelar', async () => {
    useTraspasos();

    const cancelarConfig = mutationConfigs[2];
    (traspasosApi.cancelar as vi.Mock).mockResolvedValue({ data: {} });
    await cancelarConfig.mutationFn(1);

    expect(traspasosApi.cancelar).toHaveBeenCalledWith(1);
  });

  test('cancelar: onSuccess invalida queries y muestra toast', () => {
    useTraspasos();
    mutationConfigs[2].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['traspasos'] });
    expect(toast.success).toHaveBeenCalledWith('Traspaso cancelado');
  });

  test('autorizar: mutationFn llama a traspasosApi.autorizar', async () => {
    useTraspasos();

    const autorizarConfig = mutationConfigs[3];
    (traspasosApi.autorizar as vi.Mock).mockResolvedValue({ data: {} });
    await autorizarConfig.mutationFn(1);

    expect(traspasosApi.autorizar).toHaveBeenCalledWith(1);
  });

  test('autorizar: onSuccess invalida queries y muestra toast', () => {
    useTraspasos();
    mutationConfigs[3].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['traspasos'] });
    expect(toast.success).toHaveBeenCalledWith('Traspaso autorizado correctamente');
  });

  test('error en enviar muestra toast.error con message', () => {
    useTraspasos();
    mutationConfigs[0].onError({ response: { data: { message: 'Sin stock' } } });

    expect(toast.error).toHaveBeenCalledWith('Sin stock');
  });

  test('error en enviar sin message usa default', () => {
    useTraspasos();
    mutationConfigs[0].onError({ response: { data: {} } });

    expect(toast.error).toHaveBeenCalledWith('Error al confirmar envío');
  });

  test('retorna traspasos del query', () => {
    const { traspasos } = useTraspasos();
    expect(traspasos.data).toEqual(mockData);
  });

  test('retorna las 4 mutaciones', () => {
    const result = useTraspasos();
    expect(result.enviar).toBeDefined();
    expect(result.recibir).toBeDefined();
    expect(result.cancelar).toBeDefined();
    expect(result.autorizar).toBeDefined();
  });
});
