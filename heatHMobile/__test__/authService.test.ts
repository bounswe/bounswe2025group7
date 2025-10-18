import { authService } from '@/services/authService';
import { storage } from '@/utils/storage';
import { apiClient } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => {
  return {
    apiClient: { post: jest.fn() },
  };
});

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login stores tokens and returns response', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { accessToken: 'A', refreshToken: 'R' } });
    const setItemSpy = jest.spyOn(storage, 'setItem');

    const result = await authService.login({ username: 'u', password: 'p' });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { username: 'u', password: 'p' });
    expect(setItemSpy).toHaveBeenCalledWith('accessToken', 'A');
    expect(setItemSpy).toHaveBeenCalledWith('refreshToken', 'R');
    expect(result).toEqual({ accessToken: 'A', refreshToken: 'R' });
  });

  it('refreshToken uses stored refresh token and updates tokens', async () => {
    jest.spyOn(storage, 'getItem').mockResolvedValueOnce('R0');
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { accessToken: 'A1', refreshToken: 'R1' } });
    const setItemSpy = jest.spyOn(storage, 'setItem');

    const result = await authService.refreshToken();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh-token', { refreshToken: 'R0' });
    expect(setItemSpy).toHaveBeenCalledWith('accessToken', 'A1');
    expect(setItemSpy).toHaveBeenCalledWith('refreshToken', 'R1');
    expect(result).toEqual({ accessToken: 'A1', refreshToken: 'R1' });
  });

  it('refreshToken throws when no refresh token', async () => {
    jest.spyOn(storage, 'getItem').mockResolvedValueOnce(null);
    await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
  });
});


