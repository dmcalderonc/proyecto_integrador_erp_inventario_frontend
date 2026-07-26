import { solicitudesApi } from './solicitudes.api';
import api from './http';

vi.mock('./http');

describe('solicitudesApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll pasa params correctamente', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await solicitudesApi.getAll({ estado: 'PENDIENTE' });
    expect(api.get).toHaveBeenCalledWith('/solicitudes-compra', { params: { estado: 'PENDIENTE' } });
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await solicitudesApi.getById(42);
    expect(api.get).toHaveBeenCalledWith('/solicitudes-compra/42');
  });

  test('create envía dto', async () => {
    const dto = { proyectoId: '1', usuarioSolicitanteId: '2', detalles: [{ materialId: 1, cantidadRequerida: 5 }] };
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1, ...dto } });
    await solicitudesApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/solicitudes-compra', dto);
  });

  test('update usa PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await solicitudesApi.update(10, { estado: 'APROBADO' });
    expect(api.patch).toHaveBeenCalledWith('/solicitudes-compra/10', { estado: 'APROBADO' });
  });

  test('cotizar llama PATCH sin body', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await solicitudesApi.cotizar(5);
    expect(api.patch).toHaveBeenCalledWith('/solicitudes-compra/5/cotizar');
  });

  test('aprobar llama PATCH sin body', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await solicitudesApi.aprobar(5);
    expect(api.patch).toHaveBeenCalledWith('/solicitudes-compra/5/aprobar');
  });

  test('procesar llama PATCH sin body', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await solicitudesApi.procesar(5);
    expect(api.patch).toHaveBeenCalledWith('/solicitudes-compra/5/procesar');
  });
});
