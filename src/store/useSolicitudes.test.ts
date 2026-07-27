import { useSolicitudes } from './useSolicitudes';
import { solicitudesApi } from '../api/solicitudes.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

vi.mock('../api/solicitudes.api');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockInvalidateQueries = vi.fn();

const mockData = [
  { id: 1, estado: 'PENDIENTE', proyectoId: '1' },
  { id: 2, estado: 'COTIZANDO', proyectoId: '2' },
];

describe('useSolicitudes', () => {
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

  test('fetch sin filtros pasa params vacíos', () => {
    useSolicitudes();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['solicitudes', undefined] }),
    );
  });

  test('queryFn sin filtros llama a getAll con undefined', async () => {
    useSolicitudes();

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (solicitudesApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    const result = await queryFn();

    expect(solicitudesApi.getAll).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockData);
  });

  test('queryFn con filtro de estado', async () => {
    useSolicitudes({ estado: 'PENDIENTE' });

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (solicitudesApi.getAll as vi.Mock).mockResolvedValue({ data: [mockData[0]] });
    await queryFn();

    expect(solicitudesApi.getAll).toHaveBeenCalledWith({ estado: 'PENDIENTE' });
  });

  test('queryFn con filtro de proyectoId', async () => {
    useSolicitudes({ proyectoId: '5' });

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (solicitudesApi.getAll as vi.Mock).mockResolvedValue({ data: [] });
    await queryFn();

    expect(solicitudesApi.getAll).toHaveBeenCalledWith({ proyectoId: '5' });
  });

  test('queryFn con ambos filtros', async () => {
    useSolicitudes({ estado: 'COTIZANDO', proyectoId: '3' });

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (solicitudesApi.getAll as vi.Mock).mockResolvedValue({ data: [] });
    await queryFn();

    expect(solicitudesApi.getAll).toHaveBeenCalledWith({
      estado: 'COTIZANDO',
      proyectoId: '3',
    });
  });

  test('crear: mutationFn llama a solicitudesApi.create', async () => {
    useSolicitudes();

    const crearConfig = mutationConfigs[0];
    const dto = { proyectoId: '1', usuarioSolicitanteId: '1', detalles: [] };
    (solicitudesApi.create as vi.Mock).mockResolvedValue({ data: { id: 3 } });
    await crearConfig.mutationFn(dto);

    expect(solicitudesApi.create).toHaveBeenCalledWith(dto);
  });

  test('crear: onSuccess invalida queries y muestra toast', () => {
    useSolicitudes();
    mutationConfigs[0].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['solicitudes'] });
    expect(toast.success).toHaveBeenCalledWith('Solicitud creada exitosamente');
  });

  test('actualizar: mutationFn llama a solicitudesApi.update', async () => {
    useSolicitudes();

    const actualizarConfig = mutationConfigs[1];
    (solicitudesApi.update as vi.Mock).mockResolvedValue({ data: {} });
    await actualizarConfig.mutationFn({ id: 1, dto: { estado: 'APROBADA' } as any });

    expect(solicitudesApi.update).toHaveBeenCalledWith(1, { estado: 'APROBADA' });
  });

  test('actualizar: onSuccess invalida queries y muestra toast', () => {
    useSolicitudes();
    mutationConfigs[1].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['solicitudes'] });
    expect(toast.success).toHaveBeenCalledWith('Solicitud actualizada exitosamente');
  });

  test('cotizar: mutationFn llama a solicitudesApi.cotizar', async () => {
    useSolicitudes();

    const cotizarConfig = mutationConfigs[2];
    (solicitudesApi.cotizar as vi.Mock).mockResolvedValue({ data: {} });
    await cotizarConfig.mutationFn(1);

    expect(solicitudesApi.cotizar).toHaveBeenCalledWith(1);
  });

  test('cotizar: onSuccess invalida queries y muestra toast', () => {
    useSolicitudes();
    mutationConfigs[2].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['solicitudes'] });
    expect(toast.success).toHaveBeenCalledWith('Solicitud marcada como cotizando');
  });

  test('aprobar: mutationFn llama a solicitudesApi.aprobar', async () => {
    useSolicitudes();

    const aprobarConfig = mutationConfigs[3];
    (solicitudesApi.aprobar as vi.Mock).mockResolvedValue({ data: {} });
    await aprobarConfig.mutationFn(1);

    expect(solicitudesApi.aprobar).toHaveBeenCalledWith(1);
  });

  test('aprobar: onSuccess invalida queries y muestra toast', () => {
    useSolicitudes();
    mutationConfigs[3].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['solicitudes'] });
    expect(toast.success).toHaveBeenCalledWith('Solicitud aprobada exitosamente');
  });

  test('procesar: mutationFn llama a solicitudesApi.procesar', async () => {
    useSolicitudes();

    const procesarConfig = mutationConfigs[4];
    (solicitudesApi.procesar as vi.Mock).mockResolvedValue({ data: {} });
    await procesarConfig.mutationFn(1);

    expect(solicitudesApi.procesar).toHaveBeenCalledWith(1);
  });

  test('procesar: onSuccess invalida queries y muestra toast', () => {
    useSolicitudes();
    mutationConfigs[4].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['solicitudes'] });
    expect(toast.success).toHaveBeenCalledWith('Solicitud procesada exitosamente');
  });

  test('error en crear muestra toast.error', () => {
    useSolicitudes();
    mutationConfigs[0].onError({ response: { data: { message: 'Error creación' } } });

    expect(toast.error).toHaveBeenCalledWith('Error creación');
  });

  test('error en aprobar sin message usa default', () => {
    useSolicitudes();
    mutationConfigs[3].onError({ response: { data: {} } });

    expect(toast.error).toHaveBeenCalledWith('Error al aprobar solicitud');
  });

  test('retorna solicitudes vacío cuando data es undefined', () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: true } as any);

    const { solicitudes } = useSolicitudes();
    expect(solicitudes).toEqual([]);
  });

  test('retorna las 5 mutaciones', () => {
    const result = useSolicitudes();
    expect(result.crear).toBeDefined();
    expect(result.actualizar).toBeDefined();
    expect(result.cotizar).toBeDefined();
    expect(result.aprobar).toBeDefined();
    expect(result.procesar).toBeDefined();
  });
});
