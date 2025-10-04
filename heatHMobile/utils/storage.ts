// Temporary in-memory storage solution
// TODO: Replace with AsyncStorage for persistent storage
const inMemoryStorage: Record<string, string> = {};

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return inMemoryStorage[key] || null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      inMemoryStorage[key] = value;
      console.log(`Stored ${key}:`, value.substring(0, 20) + '...');
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      delete inMemoryStorage[key];
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      Object.keys(inMemoryStorage).forEach(key => delete inMemoryStorage[key]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

