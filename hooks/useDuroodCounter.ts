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

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Subscribe to global count changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    try {
      unsubscribe = firebaseService.subscribeToGlobalCount((count) => {
        setGlobalCount(count);
      });
    } catch (error) {
      console.warn('Failed to subscribe to Firebase updates:', error);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load personal count from local storage first (fast)
      const personal = await storageService.getPersonalCount();
      setPersonalCount(personal);

      // Set loading to false immediately after personal count loads
      setIsLoading(false);

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

  const incrementCount = useCallback(async (increment: number = 1) => {
    try {
      setIsIncrementing(true);
      setError(null);

      // Update local count first (fast)
      const newPersonalCount = await storageService.incrementPersonalCount(increment);
      setPersonalCount(newPersonalCount);

      // Add to history
      await historyService.addHistoryEntry(increment, 'increment');

      // Update global count and handle errors properly
      try {
        await firebaseService.incrementGlobalCount(increment);
        console.log('✅ Global count updated successfully');
      } catch (err) {
        console.error('❌ Firebase update failed:', err);
        setError('Failed to sync with global count. Your personal count is saved.');
      }
    } catch (err) {
      setError('Failed to increment count');
      console.error('Error incrementing count:', err);
    } finally {
      setIsIncrementing(false);
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
        await firebaseService.incrementGlobalCount(count);
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