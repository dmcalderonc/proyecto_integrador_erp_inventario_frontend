import { publicMaterialesApi } from './public-materiales.api';
import api from './http';

vi.mock('./http');

describe('publicMaterialesApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll pasa params correctamente', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { data: [], meta: {} } });
    await publicMaterialesApi.getAll({ search: 'papel', page: 2, limit: 10 });
    expect(api.get).toHaveBeenCalledWith('/public/materiales', {
      params: { search: 'papel', page: 2, limit: 10 }
    });
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await publicMaterialesApi.getById(25);
    expect(api.get).toHaveBeenCalledWith('/public/materiales/25');
  });

  test('getCategorias llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await publicMaterialesApi.getCategorias();
    expect(api.get).toHaveBeenCalledWith('/public/categorias');
  });
});
