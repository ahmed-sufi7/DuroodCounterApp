import { get, onValue, ref, runTransaction, serverTimestamp, set } from 'firebase/database';
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
  private dailyCountsRef = ref(database, 'dailyCounts');

  private getUTCDateKey(nowMs?: number): string {
    const d = nowMs ? new Date(nowMs) : new Date();
    const y = d.getUTCFullYear();
    const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = d.getUTCDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

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

  // Add user count increment (atomic, handles concurrency)
  async incrementGlobalCount(increment: number = 1): Promise<void> {
    try {
      console.log(`🔄 Incrementing global count by ${increment} (transaction)...`);
      await runTransaction(this.globalCountRef, (current) => {
        const currentVal = typeof current === 'number' && !isNaN(current) ? current : 0;
        return currentVal + increment;
      }, { applyLocally: false });
      await set(this.lastUpdatedRef, serverTimestamp());
      console.log(`✅ Global count incremented by ${increment}`);
    } catch (error) {
      console.error('❌ Error incrementing global count (transaction):', error);
      throw error; // Re-throw to let caller handle
    }
  }

  // Increment today's UTC daily bucket
  async incrementDailyCount(increment: number = 1, nowMs?: number): Promise<void> {
    const key = this.getUTCDateKey(nowMs);
    const bucketRef = ref(database, `dailyCounts/${key}`);
    await runTransaction(bucketRef, (current) => {
      const currentVal = typeof current === 'number' && !isNaN(current) ? current : 0;
      return currentVal + increment;
    }, { applyLocally: false });
  }

  // Increment both global and today's daily bucket
  async incrementGlobalAndDailyCount(increment: number = 1): Promise<void> {
    await this.incrementGlobalCount(increment);
    try {
      await this.incrementDailyCount(increment);
    } catch (e) {
      // If daily increment fails, we keep global consistent and log the error
      console.warn('Failed to increment daily bucket:', e);
    }
  }

  // Subscribe to daily counts map (all days). Caller can slice last N days.
  subscribeToDailyCounts(callback: (map: Record<string, number>) => void): () => void {
    const unsubscribe = onValue(this.dailyCountsRef, (snapshot) => {
      const map = snapshot.val() || {};
      callback(map);
    }, (error) => {
      console.error('❌ Error in daily counts subscription:', error);
    });
    return unsubscribe;
  }

  async savePushToken(args: { token: string; provider: 'expo' | 'fcm'; platform: string }): Promise<void> {
    try {
      const safe = args.token.replace(/[:/\\.#$\[\]]/g, '_');
      const key = `${args.platform}/${args.provider}/${safe}`;
      const tokenRef = ref(database, `pushTokens/${key}`);
      await set(tokenRef, {
        token: args.token,
        provider: args.provider,
        platform: args.platform,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Failed to save push token:', e);
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