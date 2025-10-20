import { apiClient } from '@/services/apiClient';
import { storage } from '@/utils/storage';

describe('apiClient interceptors', () => {
  const originalAdapter = apiClient.defaults.adapter;

  afterEach(() => {
    // restore adapter after each test
    apiClient.defaults.adapter = originalAdapter!;
    jest.restoreAllMocks();
  });

  it('attaches Authorization header when accessToken exists', async () => {
    jest.spyOn(storage, 'getItem').mockResolvedValueOnce('TOKEN');

    const adapterMock = jest.fn(async (config: any) => {
      const headers: any = config.headers || {};
      const headerFromObj = headers.Authorization || headers.authorization;
      const headerFromMap = headers.get?.('Authorization');
      const authHeader = headerFromObj ?? headerFromMap;
      expect(authHeader).toBe('Bearer TOKEN');
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config } as any;
    });
    apiClient.defaults.adapter = adapterMock as any;

    const res = await apiClient.get('/anything');
    expect(res.data).toEqual({ ok: true });
    expect(adapterMock).toHaveBeenCalled();
  });

  it('does not set Authorization when no token', async () => {
    jest.spyOn(storage, 'getItem').mockResolvedValueOnce(null);

    const adapterMock = jest.fn(async (config: any) => {
      const headers: any = config.headers || {};
      const headerFromObj = headers.Authorization || headers.authorization;
      const headerFromMap = headers.get?.('Authorization');
      const authHeader = headerFromObj ?? headerFromMap;
      expect(authHeader).toBeUndefined();
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config } as any;
    });
    apiClient.defaults.adapter = adapterMock as any;

    await apiClient.get('/anything');
    expect(adapterMock).toHaveBeenCalled();
  });
});


