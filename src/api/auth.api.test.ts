import { authApi } from './auth.api';
import api from './http';

vi.mock('./http');

describe('authApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('login envía credentials', async () => {
    const creds = { email: 'a@b.com', password: '123' };
    (api.post as vi.Mock).mockResolvedValue({ data: { access_token: 'tok', user: {} } });
    await authApi.login(creds);
    expect(api.post).toHaveBeenCalledWith('/auth/login', creds);
  });

  test('unlinkGoogle llama DELETE', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await authApi.unlinkGoogle();
    expect(api.delete).toHaveBeenCalledWith('/auth/google');
  });
});
