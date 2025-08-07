import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HistoryEntry {
  id: string;
  count: number;
  type: 'increment' | 'bulk';
  timestamp: number;
}

const STORAGE_KEYS = {
  HISTORY: 'duroodHistory',
  MAX_HISTORY_ENTRIES: 50, // Keep last 50 entries
};

class HistoryService {
  // Get all history entries
  async getHistory(): Promise<HistoryEntry[]> {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!historyJson) {
        return [];
      }
      
      const history: HistoryEntry[] = JSON.parse(historyJson);
      // Sort by timestamp descending (most recent first)
      return history.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  // Add a new history entry
  async addHistoryEntry(count: number, type: 'increment' | 'bulk'): Promise<void> {
    try {
      const history = await this.getHistory();
      
      const newEntry: HistoryEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        count,
        type,
        timestamp: Date.now(),
      };

      // Add new entry to the beginning
      history.unshift(newEntry);

      // Keep only the last MAX_HISTORY_ENTRIES
      const trimmedHistory = history.slice(0, STORAGE_KEYS.MAX_HISTORY_ENTRIES);

      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error adding history entry:', error);
      // Don't throw error as history is not critical functionality
    }
  }

  // Get total count from history
  async getTotalFromHistory(): Promise<number> {
    try {
      const history = await this.getHistory();
      return history.reduce((sum: number, entry: HistoryEntry) => sum + entry.count, 0);
    } catch (error) {
      console.error('Error getting total from history:', error);
      return 0;
    }
  }

  // Get history for a specific date range
  async getHistoryByDateRange(startDate: Date, endDate: Date): Promise<HistoryEntry[]> {
    try {
      const history = await this.getHistory();
      return history.filter(entry => 
        entry.timestamp >= startDate.getTime() && 
        entry.timestamp <= endDate.getTime()
      );
    } catch (error) {
      console.error('Error getting history by date range:', error);
      return [];
    }
  }

  // Get today's history
  async getTodaysHistory(): Promise<HistoryEntry[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getHistoryByDateRange(startOfDay, endOfDay);
  }

  // Get this week's history
  async getWeekHistory(): Promise<HistoryEntry[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Go to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return this.getHistoryByDateRange(startOfWeek, endOfWeek);
  }

  // Get this month's history
  async getMonthHistory(): Promise<HistoryEntry[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    return this.getHistoryByDateRange(startOfMonth, endOfMonth);
  }

  // Get statistics
  async getStats(): Promise<{
    totalCount: number;
    totalSessions: number;
    averagePerSession: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
  }> {
    try {
      const [history, todayHistory, weekHistory, monthHistory] = await Promise.all([
        this.getHistory(),
        this.getTodaysHistory(),
        this.getWeekHistory(),
        this.getMonthHistory(),
      ]);

      const totalCount = history.reduce((sum: number, entry: HistoryEntry) => sum + entry.count, 0);
      const totalSessions = history.length;
      const averagePerSession = totalSessions > 0 ? Math.round(totalCount / totalSessions) : 0;
      
      const todayCount = todayHistory.reduce((sum: number, entry: HistoryEntry) => sum + entry.count, 0);
      const weekCount = weekHistory.reduce((sum: number, entry: HistoryEntry) => sum + entry.count, 0);
      const monthCount = monthHistory.reduce((sum: number, entry: HistoryEntry) => sum + entry.count, 0);

      return {
        totalCount,
        totalSessions,
        averagePerSession,
        todayCount,
        weekCount,
        monthCount,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalCount: 0,
        totalSessions: 0,
        averagePerSession: 0,
        todayCount: 0,
        weekCount: 0,
        monthCount: 0,
      };
    }
  }

  // Clear all history (for testing or user request)
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  }
}

export const historyService = new HistoryService();
