import { materialesApi } from './materiales.api';
import api from './http';

vi.mock('./http');

describe('materialesApi', () => {
  test('getAll pasa params correctamente', async () => {
    const mockData = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    (api.get as vi.Mock).mockResolvedValue({ data: mockData });

    const result = await materialesApi.getAll({ page: 1, limit: 20, search: 'disco', categoriaId: 5 });
    
    expect(api.get).toHaveBeenCalledWith('/materiales', {
      params: { page: 1, limit: 20, search: 'disco', categoriaId: 5 }
    });
    expect(result).toEqual(mockData);
  });

  test('create envía dto completo', async () => {
    const dto = { nombre: 'Test', descripcion: '', unidad_medida_id: 1, categoria_id: 1 };
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1, ...dto } });

    await materialesApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/materiales', dto);
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { id: 5, nombre: 'Material' } });
    const result = await materialesApi.getById(5);
    expect(api.get).toHaveBeenCalledWith('/materiales/5');
    expect(result.data).toEqual({ id: 5, nombre: 'Material' });
  });

  test('update envía PUT con id', async () => {
    (api.put as vi.Mock).mockResolvedValue({ data: { id: 3 } });
    await materialesApi.update(3, { nombre: 'Nuevo' });
    expect(api.put).toHaveBeenCalledWith('/materiales/3', { nombre: 'Nuevo' });
  });

  test('delete llama DELETE con id', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await materialesApi.delete(7);
    expect(api.delete).toHaveBeenCalledWith('/materiales/7');
  });
});
