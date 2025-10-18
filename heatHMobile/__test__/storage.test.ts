import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '@/utils/storage';

describe('storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('sets and gets an item', async () => {
    await storage.setItem('k', 'v');
    const value = await storage.getItem('k');
    expect(value).toBe('v');
  });

  it('returns null for missing keys', async () => {
    const value = await storage.getItem('missing');
    expect(value).toBeNull();
  });

  it('removes an item', async () => {
    await storage.setItem('k', 'v');
    await storage.removeItem('k');
    const value = await storage.getItem('k');
    expect(value).toBeNull();
  });

  it('clears all items', async () => {
    await storage.setItem('a', '1');
    await storage.setItem('b', '2');
    await storage.clear();
    const [a, b] = await Promise.all([
      storage.getItem('a'),
      storage.getItem('b'),
    ]);
    expect(a).toBeNull();
    expect(b).toBeNull();
  });
});


