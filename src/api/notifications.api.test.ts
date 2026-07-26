import { notificationsApi } from './notifications.api';
import api from './http';

vi.mock('./http');

describe('notificationsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await notificationsApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/notifications');
  });

  test('getUnreadCount llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { count: 3 } });
    const result = await notificationsApi.getUnreadCount();
    expect(api.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(result.data).toEqual({ count: 3 });
  });

  test('markAsRead llama PATCH con id', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await notificationsApi.markAsRead('noti-5');
    expect(api.patch).toHaveBeenCalledWith('/notifications/noti-5/read');
  });

  test('markAllAsRead llama PATCH sin id', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await notificationsApi.markAllAsRead();
    expect(api.patch).toHaveBeenCalledWith('/notifications/read-all');
  });
});
