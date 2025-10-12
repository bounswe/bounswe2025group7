import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      console.log(`Storage: Getting item ${key}`);
      const value = await AsyncStorage.getItem(key);
      console.log(`Storage: Retrieved ${key}:`, value ? `Value exists (${value.substring(0, 20)}...)` : 'No value');
      return value;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log(`Stored ${key}:`, value.substring(0, 20) + '...');
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`Removed ${key} from storage`);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

