import { semanticSearchService } from '@/services/semanticSearchService';
import { apiClient } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('semanticSearchService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('search posts query with topK and returns data', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: [{ id: 1 }] });
    const data = await semanticSearchService.search('chicken', 5);
    expect(apiClient.post).toHaveBeenCalledWith('/search', { query: 'chicken', topK: 5 });
    expect(data).toEqual([{ id: 1 }]);
  });
});


