import { usersApi } from './users.api';
import api from './http';

vi.mock('./http');

describe('usersApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await usersApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/users');
  });

  test('create envía dto', async () => {
    const dto = { nombre: 'Test', email: 't@t.com', password: '123', rol: 'ADMIN' } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: '1' } });
    await usersApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/users', dto);
  });

  test('update usa PATCH con id string', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: { user: {} } });
    await usersApi.update('user-5', { nombre: 'Nuevo' });
    expect(api.patch).toHaveBeenCalledWith('/users/user-5', { nombre: 'Nuevo' });
  });

  test('updateBodegas llama PATCH con bodegaIds', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: { user: {} } });
    await usersApi.updateBodegas('user-7', [1, 2, 3]);
    expect(api.patch).toHaveBeenCalledWith('/users/user-7/bodegas', { bodegaIds: [1, 2, 3] });
  });

  test('delete llama DELETE', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await usersApi.delete('user-9');
    expect(api.delete).toHaveBeenCalledWith('/users/user-9');
  });
});
