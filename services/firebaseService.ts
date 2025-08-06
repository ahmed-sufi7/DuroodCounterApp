import { get, onValue, ref, set } from 'firebase/database';
import { database } from '../config/firebase';

export interface DuroodData {
  globalCount: number;
  lastUpdated: number;
}

export interface UserCount {
  count: number;
  timestamp: number;
}

class FirebaseService {
  private globalCountRef = ref(database, 'globalCount');
  private lastUpdatedRef = ref(database, 'lastUpdated');

  // Get current global count
  async getGlobalCount(): Promise<number> {
    try {
      const snapshot = await get(this.globalCountRef);
      const count = snapshot.val() || 0;
      return count;
    } catch (error) {
      console.error('Error getting global count:', error);
      return 0;
    }
  }

  // Update global count
  async updateGlobalCount(count: number): Promise<void> {
    try {
      await set(this.globalCountRef, count);
      await set(this.lastUpdatedRef, Date.now());
    } catch (error) {
      console.error('Error updating global count:', error);
      // Don't throw error, just log it
    }
  }

  // Listen to global count changes
  subscribeToGlobalCount(callback: (count: number) => void): () => void {
    const unsubscribe = onValue(this.globalCountRef, (snapshot) => {
      const count = snapshot.val() || 0;
      callback(count);
    });

    return unsubscribe;
  }

  // Add user count increment
  async incrementGlobalCount(increment: number = 1): Promise<void> {
    try {
      const currentCount = await this.getGlobalCount();
      await this.updateGlobalCount(currentCount + increment);
    } catch (error) {
      console.error('Error incrementing global count:', error);
      // Don't throw error, just log it
    }
  }
}

export const firebaseService = new FirebaseService(); 