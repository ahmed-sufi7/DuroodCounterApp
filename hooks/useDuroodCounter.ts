import { useCallback, useEffect, useState } from 'react';
import { firebaseService } from '../services/firebaseService';
import { historyService } from '../services/historyService';
import { storageService } from '../services/storageService';
import { TARGET_COUNT } from '../utils/helpers';

export function useDuroodCounter() {
  const [personalCount, setPersonalCount] = useState(0);
  const [globalCount, setGlobalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIncrements, setPendingIncrements] = useState(0);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Subscribe to global count changes
  // Note: this effect depends on flushIncrements, so it must be declared after flushIncrements.

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load personal count from local storage first (fast)
      const personal = await storageService.getPersonalCount();
      setPersonalCount(personal);

      // Set loading to false immediately after personal count loads
      setIsLoading(false);

      // Restore any queued increments (survive app restarts)
      const queued = await storageService.getPendingIncrements();
      if (queued > 0) setPendingIncrements(queued);

      // Initialize Firebase database and load global count in background
      try {
        await firebaseService.initializeDatabase();
        const global = await firebaseService.getGlobalCount();
        setGlobalCount(global);
        console.log('✅ Firebase connected and global count loaded');
      } catch (firebaseError) {
        console.warn('⚠️ Firebase connection failed, working offline:', firebaseError);
        setGlobalCount(0); // Start with 0 if Firebase is not available
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data');
      setIsLoading(false);
    }
  };

  const flushIncrements = useCallback(async () => {
    if (pendingIncrements <= 0) return;
    const toFlush = pendingIncrements;
    setPendingIncrements(0);
    storageService.savePendingIncrements(0).catch(() => {});
    try {
      await firebaseService.incrementGlobalAndDailyCount(toFlush);
    } catch (err) {
      console.warn('Background sync failed, re-queueing increments:', err);
      // Re-queue to try again later
      setPendingIncrements((v) => {
        const next = v + toFlush;
        storageService.savePendingIncrements(next).catch(() => {});
        return next;
      });
    }
  }, [pendingIncrements]);

  useEffect(() => {
    const interval = setInterval(() => {
      flushIncrements();
    }, 2000); // try every 2s
    return () => clearInterval(interval);
  }, [flushIncrements]);

  // Subscribe to global updates and periodically flush queued increments
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = firebaseService.subscribeToGlobalCount((count) => {
        setGlobalCount(count);
      });
    } catch (error) {
      console.warn('Failed to subscribe to Firebase updates:', error);
    }

    const flushInterval = setInterval(() => {
      flushIncrements();
    }, 5000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(flushInterval);
    };
  }, [flushIncrements]);

  const incrementCount = useCallback(async (increment: number = 1) => {
    try {
      // Optimistic local update: never blocks UI
      setError(null);
      setPersonalCount((prev) => prev + increment);

      // Persist in background (fire-and-forget)
      storageService.incrementPersonalCount(increment).catch((err) => {
        console.warn('Failed to persist personal count increment:', err);
      });
      historyService.addHistoryEntry(increment, 'increment').catch((err) => {
        console.warn('Failed to write history entry:', err);
      });

      // Try immediate global increment in background
      firebaseService.incrementGlobalAndDailyCount(increment).catch(() => {
        // Fallback: queue if immediate attempt fails
        setPendingIncrements((v) => {
          const next = v + increment;
          storageService.savePendingIncrements(next).catch(() => {});
          return next;
        });
      });
    } catch (err) {
      setError('Failed to increment count');
      console.error('Error incrementing count:', err);
    }
  }, []);

  const addBulkCount = useCallback(async (count: number) => {
    if (count <= 0) {
      setError('Please enter a valid number');
      return;
    }

    try {
      setIsIncrementing(true);
      setError(null);

      // Update local count first (fast)
      const newPersonalCount = await storageService.incrementPersonalCount(count);
      setPersonalCount(newPersonalCount);

      // Add to history
      await historyService.addHistoryEntry(count, 'bulk');

      // Update global count and handle errors properly
      try {
        await firebaseService.incrementGlobalAndDailyCount(count);
        console.log('✅ Global count updated successfully');
      } catch (err) {
        console.error('❌ Firebase update failed:', err);
        setError('Failed to sync with global count. Your personal count is saved.');
      }
    } catch (err) {
      setError('Failed to add bulk count');
      console.error('Error adding bulk count:', err);
    } finally {
      setIsIncrementing(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    personalCount,
    globalCount,
    isLoading,
    isIncrementing,
    error,
    incrementCount,
    addBulkCount,
    resetError,
    targetCount: TARGET_COUNT,
  };
} 