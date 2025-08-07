import { get, onValue, ref, serverTimestamp, set } from 'firebase/database';
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

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const testRef = ref(database, '.info/connected');
      const snapshot = await get(testRef);
      return snapshot.val() === true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  // Get current global count
  async getGlobalCount(): Promise<number> {
    try {
      console.log('🔄 Fetching global count from Firebase...');
      const snapshot = await get(this.globalCountRef);
      const count = snapshot.val() || 0;
      console.log('✅ Global count fetched:', count);
      return count;
    } catch (error) {
      console.error('❌ Error getting global count:', error);
      throw error; // Re-throw to let caller handle
    }
  }

  // Update global count
  async updateGlobalCount(count: number): Promise<void> {
    try {
      console.log('🔄 Updating global count to:', count);
      await set(this.globalCountRef, count);
      await set(this.lastUpdatedRef, serverTimestamp());
      console.log('✅ Global count updated successfully');
    } catch (error) {
      console.error('❌ Error updating global count:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code || 'unknown',
        details: error
      });
      throw error; // Re-throw to let caller handle
    }
  }

  // Listen to global count changes
  subscribeToGlobalCount(callback: (count: number) => void): () => void {
    console.log('🔄 Subscribing to global count changes...');
    
    const unsubscribe = onValue(this.globalCountRef, (snapshot) => {
      const count = snapshot.val() || 0;
      console.log('📡 Global count updated from Firebase:', count);
      callback(count);
    }, (error) => {
      console.error('❌ Error in global count subscription:', error);
    });

    return unsubscribe;
  }

  // Add user count increment
  async incrementGlobalCount(increment: number = 1): Promise<void> {
    try {
      console.log(`🔄 Incrementing global count by ${increment}...`);
      const currentCount = await this.getGlobalCount();
      const newCount = currentCount + increment;
      await this.updateGlobalCount(newCount);
      console.log(`✅ Global count incremented from ${currentCount} to ${newCount}`);
    } catch (error) {
      console.error('❌ Error incrementing global count:', error);
      throw error; // Re-throw to let caller handle
    }
  }

  // Initialize database with default values if needed
  async initializeDatabase(): Promise<void> {
    try {
      console.log('🔄 Initializing database...');
      const snapshot = await get(this.globalCountRef);
      if (!snapshot.exists()) {
        await this.updateGlobalCount(0);
        console.log('✅ Database initialized with default values');
      }
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService(); 