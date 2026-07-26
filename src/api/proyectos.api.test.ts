import { proyectosApi } from './proyectos.api';
import api from './http';

vi.mock('./http');

describe('proyectosApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await proyectosApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/proyectos');
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await proyectosApi.getById('proj-1');
    expect(api.get).toHaveBeenCalledWith('/proyectos/proj-1');
  });

  test('create envía dto', async () => {
    const dto = { nombre: 'Proyecto X' } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: '1' } });
    await proyectosApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/proyectos', dto);
  });

  test('update usa PATCH con id string', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await proyectosApi.update('proj-2', { nombre: 'Cambiado' });
    expect(api.patch).toHaveBeenCalledWith('/proyectos/proj-2', { nombre: 'Cambiado' });
  });

  test('delete llama DELETE con id string', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await proyectosApi.delete('proj-3');
    expect(api.delete).toHaveBeenCalledWith('/proyectos/proj-3');
  });
});
