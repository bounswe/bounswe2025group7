// Storage utility for React Native using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

class PersistentStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log('💾 Storage: Getting key', key, 'value:', value ? 'Present' : 'Null');
      return value;
    } catch (error) {
      console.error('💾 Storage: Error getting item:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      console.log('💾 Storage: Setting key', key, 'value:', value ? 'Present' : 'Null');
      await AsyncStorage.setItem(key, value);
      console.log('💾 Storage: Set complete');
    } catch (error) {
      console.error('💾 Storage: Error setting item:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log('💾 Storage: Removed key', key);
    } catch (error) {
      console.error('💾 Storage: Error removing item:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('💾 Storage: Cleared all items');
    } catch (error) {
      console.error('💾 Storage: Error clearing storage:', error);
    }
  }
}

export const storage = new PersistentStorage();
