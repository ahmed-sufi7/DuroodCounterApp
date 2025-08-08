import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PERSONAL_COUNT: 'personalCount',
  LAST_SYNCED: 'lastSynced',
  PENDING_INCREMENTS: 'pendingIncrements',
};

class StorageService {
  // Get personal count from local storage
  async getPersonalCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(STORAGE_KEYS.PERSONAL_COUNT);
      const result = count ? parseInt(count, 10) : 0;
      return result;
    } catch (error) {
      console.error('Error getting personal count:', error);
      return 0;
    }
  }

  // Save personal count to local storage
  async savePersonalCount(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PERSONAL_COUNT, count.toString());
    } catch (error) {
      console.error('Error saving personal count:', error);
      throw error;
    }
  }

  // Get last synced timestamp
  async getLastSynced(): Promise<number> {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
      return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (error) {
      console.error('Error getting last synced:', error);
      return 0;
    }
  }

  // Save last synced timestamp
  async saveLastSynced(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNCED, timestamp.toString());
    } catch (error) {
      console.error('Error saving last synced:', error);
      throw error;
    }
  }

  // Get queued pending increments for offline sync
  async getPendingIncrements(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_INCREMENTS);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      console.error('Error getting pending increments:', error);
      return 0;
    }
  }

  // Save queued pending increments for offline sync
  async savePendingIncrements(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_INCREMENTS, String(count));
    } catch (error) {
      console.error('Error saving pending increments:', error);
    }
  }

  // Increment personal count
  async incrementPersonalCount(increment: number = 1): Promise<number> {
    try {
      const currentCount = await this.getPersonalCount();
      const newCount = currentCount + increment;
      await this.savePersonalCount(newCount);
      return newCount;
    } catch (error) {
      console.error('Error incrementing personal count:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService(); 