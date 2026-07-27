import { useCotizaciones } from './useCotizaciones';
import { cotizacionesApi } from '../api/cotizaciones.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

vi.mock('../api/cotizaciones.api');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);
const mockInvalidateQueries = vi.fn();

const mockData = [
  { id: 1, estado: 'EN_EVALUACION', cantidad: 100, precioUnitario: 25 },
  { id: 2, estado: 'ELEGIDA', cantidad: 50, precioUnitario: 30 },
];

describe('useCotizaciones', () => {
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

  test('fetch cotizaciones con queryKey correcto', () => {
    useCotizaciones();

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['cotizaciones'] }),
    );
  });

  test('queryFn llama a cotizacionesApi.getAll', async () => {
    useCotizaciones();

    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    (cotizacionesApi.getAll as vi.Mock).mockResolvedValue({ data: mockData });
    const result = await queryFn();

    expect(cotizacionesApi.getAll).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  test('retorna cotizaciones del query', () => {
    const { cotizaciones } = useCotizaciones();
    expect(cotizaciones).toEqual(mockData);
  });

  test('crear: mutationFn llama a cotizacionesApi.create', async () => {
    useCotizaciones();

    const crearConfig = mutationConfigs[0];
    const dto = { requerimientoDetalleId: 1, proveedorId: 1, cantidad: 10, precioUnitario: 5 };
    (cotizacionesApi.create as vi.Mock).mockResolvedValue({ data: { id: 3 } });
    await crearConfig.mutationFn(dto);

    expect(cotizacionesApi.create).toHaveBeenCalledWith(dto);
  });

  test('crear: onSuccess invalida queries y muestra toast', () => {
    useCotizaciones();
    mutationConfigs[0].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cotizaciones'] });
    expect(toast.success).toHaveBeenCalledWith('Cotización creada exitosamente');
  });

  test('actualizar: mutationFn llama a cotizacionesApi.update', async () => {
    useCotizaciones();

    const actualizarConfig = mutationConfigs[1];
    (cotizacionesApi.update as vi.Mock).mockResolvedValue({ data: {} });
    await actualizarConfig.mutationFn({ id: 1, dto: { cantidad: 200 } });

    expect(cotizacionesApi.update).toHaveBeenCalledWith(1, { cantidad: 200 });
  });

  test('actualizar: onSuccess invalida queries y muestra toast', () => {
    useCotizaciones();
    mutationConfigs[1].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cotizaciones'] });
    expect(toast.success).toHaveBeenCalledWith('Cotización actualizada exitosamente');
  });

  test('eliminar: mutationFn llama a cotizacionesApi.delete', async () => {
    useCotizaciones();

    const eliminarConfig = mutationConfigs[2];
    (cotizacionesApi.delete as vi.Mock).mockResolvedValue({ data: {} });
    await eliminarConfig.mutationFn(1);

    expect(cotizacionesApi.delete).toHaveBeenCalledWith(1);
  });

  test('eliminar: onSuccess invalida queries y muestra toast', () => {
    useCotizaciones();
    mutationConfigs[2].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cotizaciones'] });
    expect(toast.success).toHaveBeenCalledWith('Cotización eliminada exitosamente');
  });

  test('seleccionar: mutationFn llama a cotizacionesApi.seleccionar', async () => {
    useCotizaciones();

    const seleccionarConfig = mutationConfigs[3];
    (cotizacionesApi.seleccionar as vi.Mock).mockResolvedValue({ data: {} });
    await seleccionarConfig.mutationFn(1);

    expect(cotizacionesApi.seleccionar).toHaveBeenCalledWith(1);
  });

  test('seleccionar: onSuccess invalida queries y muestra toast', () => {
    useCotizaciones();
    mutationConfigs[3].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cotizaciones'] });
    expect(toast.success).toHaveBeenCalledWith('Cotización seleccionada exitosamente');
  });

  test('descartar: mutationFn llama a cotizacionesApi.descartar', async () => {
    useCotizaciones();

    const descartarConfig = mutationConfigs[4];
    (cotizacionesApi.descartar as vi.Mock).mockResolvedValue({ data: {} });
    await descartarConfig.mutationFn(2);

    expect(cotizacionesApi.descartar).toHaveBeenCalledWith(2);
  });

  test('descartar: onSuccess invalida queries y muestra toast', () => {
    useCotizaciones();
    mutationConfigs[4].onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cotizaciones'] });
    expect(toast.success).toHaveBeenCalledWith('Cotización descartada exitosamente');
  });

  test('error en crear muestra toast.error con message', () => {
    useCotizaciones();
    mutationConfigs[0].onError({ response: { data: { message: 'Duplicada' } } });

    expect(toast.error).toHaveBeenCalledWith('Duplicada');
  });

  test('error en crear sin message usa default', () => {
    useCotizaciones();
    mutationConfigs[0].onError({ response: { data: {} } });

    expect(toast.error).toHaveBeenCalledWith('Error al crear cotización');
  });

  test('retorna las 5 mutaciones', () => {
    const result = useCotizaciones();
    expect(result.crear).toBeDefined();
    expect(result.actualizar).toBeDefined();
    expect(result.eliminar).toBeDefined();
    expect(result.seleccionar).toBeDefined();
    expect(result.descartar).toBeDefined();
  });
});
