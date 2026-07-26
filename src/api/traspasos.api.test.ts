import { traspasosApi } from './traspasos.api';
import api from './http';

vi.mock('./http');

describe('traspasosApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll pasa params correctamente', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await traspasosApi.getAll({ estado: 'PENDIENTE', bodegaOrigenId: 1 });
    expect(api.get).toHaveBeenCalledWith('/traspasos', {
      params: { estado: 'PENDIENTE', bodegaOrigenId: 1 }
    });
  });

  test('getAll sin params', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await traspasosApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/traspasos', { params: undefined });
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await traspasosApi.getById(5);
    expect(api.get).toHaveBeenCalledWith('/traspasos/5');
  });

  test('create envía dto', async () => {
    const dto = { bodegaOrigenId: 1, bodegaDestinoId: 2, detalles: [] };
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await traspasosApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/traspasos', dto);
  });

  test('autorizar llama PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await traspasosApi.autorizar(3);
    expect(api.patch).toHaveBeenCalledWith('/traspasos/3/autorizar');
  });

  test('enviar llama PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await traspasosApi.enviar(3);
    expect(api.patch).toHaveBeenCalledWith('/traspasos/3/enviar');
  });

  test('recibir llama PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await traspasosApi.recibir(3);
    expect(api.patch).toHaveBeenCalledWith('/traspasos/3/recibir');
  });

  test('cancelar llama PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await traspasosApi.cancelar(3);
    expect(api.patch).toHaveBeenCalledWith('/traspasos/3/cancelar');
  });
});
