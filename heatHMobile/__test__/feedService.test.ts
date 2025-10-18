import { feedService } from '@/services/feedService';
import { apiClient } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('feedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('list returns data array', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: [1, 2, 3] });
    const data = await feedService.list();
    expect(apiClient.get).toHaveBeenCalledWith('/feed');
    expect(data).toEqual([1, 2, 3]);
  });

  it('getRecentFeeds calls with pageNumber param', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: ['a'] });
    const data = await feedService.getRecentFeeds(2);
    expect(apiClient.get).toHaveBeenCalledWith('/feeds/recent', { params: { pageNumber: 2 } });
    expect(data).toEqual(['a']);
  });

  it('createFeed posts payload', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { id: 5 } });
    const payload = { text: 'hi' };
    const res = await feedService.createFeed(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/feeds/created-feed', payload);
    expect(res).toEqual({ id: 5 });
  });

  it('like/unlike feed', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: true });
    await feedService.likeFeed(10);
    expect(apiClient.post).toHaveBeenCalledWith('/feeds/like', { feedId: 10 });
    await feedService.unlikeFeed(10);
    expect(apiClient.post).toHaveBeenCalledWith('/feeds/unlike', { feedId: 10 });
  });

  it('comment and fetch comments', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({ data: { ok: 1 } });
    const c = await feedService.commentFeed(9, 'hello');
    expect(apiClient.post).toHaveBeenCalledWith('/feeds/comment', { feedId: 9, message: 'hello' });
    expect(c).toEqual({ ok: 1 });

    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: [{ id: 1 }] });
    const comments = await feedService.getFeedComments(9);
    expect(apiClient.get).toHaveBeenCalledWith('/feeds/get-feed-comments', { params: { feedId: 9 } });
    expect(comments).toEqual([{ id: 1 }]);
  });
});


