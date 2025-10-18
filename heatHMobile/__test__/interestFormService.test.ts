import { interestFormService } from '@/services/interestFormService';
import { apiClient } from '@/services/apiClient';
import axios from 'axios';

jest.mock('@/services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe('interestFormService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('checkFirstLogin returns backend value on success', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: true });
    await expect(interestFormService.checkFirstLogin()).resolves.toBe(true);
  });

  it('checkFirstLogin returns false on 404/403', async () => {
    const err404 = { isAxiosError: true, response: { status: 404 } } as any;
    (axios.isAxiosError as any) = () => true;
    (apiClient.get as jest.Mock).mockRejectedValueOnce(err404);
    await expect(interestFormService.checkFirstLogin()).resolves.toBe(false);

    const err403 = { isAxiosError: true, response: { status: 403 } } as any;
    (apiClient.get as jest.Mock).mockRejectedValueOnce(err403);
    await expect(interestFormService.checkFirstLogin()).resolves.toBe(false);
  });

  it('checkFirstLogin rethrows other errors', async () => {
    const otherErr = { isAxiosError: true, response: { status: 500 } } as any;
    (apiClient.get as jest.Mock).mockRejectedValueOnce(otherErr);
    await expect(interestFormService.checkFirstLogin()).rejects.toBe(otherErr);
  });

  it('create/get/update interest form calls the endpoints', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { ok: true } });
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { id: 1 } });
    (apiClient.put as jest.Mock).mockResolvedValueOnce({ data: { ok: true } });

    const payload = { name: 'a', surname: 'b', dateOfBirth: '2020-01-01', height: 170, weight: 60, gender: 'F' } as any;

    expect(await interestFormService.createInterestForm(payload)).toEqual({ ok: true });
    expect(apiClient.post).toHaveBeenCalledWith('/interest-form/submit', payload);

    expect(await interestFormService.getInterestForm()).toEqual({ id: 1 });
    expect(apiClient.get).toHaveBeenCalledWith('/interest-form/get-form');

    expect(await interestFormService.updateInterestForm(payload)).toEqual({ ok: true });
    expect(apiClient.put).toHaveBeenCalledWith('/interest-form/update-form', payload);
  });
});


