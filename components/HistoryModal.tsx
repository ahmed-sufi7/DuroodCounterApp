import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { formatNumber } from '../utils/helpers';

// Import types and service
import type { HistoryEntry } from '../services/historyService';
import { buildLastNDaysBuckets, computeNiceMax, historyService } from '../services/historyService';
interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  personalCount: number;
}

export function HistoryModal({ visible, onClose, personalCount }: HistoryModalProps) {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecited, setTotalRecited] = useState(0);
  const [daily7, setDaily7] = useState<{ label: string; dateKey: string; value: number }[]>([]);
  const [maxDaily, setMaxDaily] = useState(0);
  const [windowKey, setWindowKey] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const history = await historyService.getHistory();
      setHistoryData(history);

      // Calculate total recited
      const total = history.reduce((sum: number, entry: HistoryEntry) => sum + entry.count, 0);
      setTotalRecited(total);

      // Build last 7 days series
      const days = buildLastNDaysBuckets(history, 7);
      // Apply optimistic delta so the graph matches the contribution card logic
      const historyTotal = total;
      const pendingDelta = Math.max(0, personalCount - historyTotal);
      if (pendingDelta > 0 && days.length > 0) {
        const lastIdx = days.length - 1;
        days[lastIdx] = { ...days[lastIdx], value: days[lastIdx].value + pendingDelta };
      }
      setDaily7(days);
      const firstKey = days[0]?.dateKey ?? '';
      const lastKey = days[days.length - 1]?.dateKey ?? '';
      const nextWindowKey = `${firstKey}_${lastKey}`;
      if (windowKey !== nextWindowKey) {
        setWindowKey(nextWindowKey);
        setMaxDaily(computeNiceMax(days));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTypeText = (type: 'increment' | 'bulk') => {
    return type === 'increment' ? 'Tally Counter' : 'Bulk Add';
  };

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.historyItem}>
      <View
        style={[
          styles.historyTypeBadge,
          item.type === 'increment' ? styles.badgeIncrement : styles.badgeBulk,
        ]}
      >
        <Ionicons
          name={item.type === 'increment' ? 'add-circle-outline' : 'cloud-upload-outline'}
          size={18}
          color={Colors.neutral.white}
        />
      </View>
      <View style={styles.historyTextBlock}>
        <Text style={styles.historyPrimary}>{getTypeText(item.type)}</Text>
        <Text style={styles.historySecondary}>{formatDate(item.timestamp)}</Text>
      </View>
      <View style={styles.historyValueBlock}>
        <Text style={styles.historyCount}>+{formatNumber(item.count)}</Text>
        <Text style={styles.historyValueLabel}>Durood</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="analytics-outline" size={56} color={Colors.primary.darkTeal} />
      <Text style={styles.emptyStateTitle}>No History Yet</Text>
      <Text style={styles.emptyStateText}>Start reciting Durood to see your history here</Text>
    </View>
  );

  const renderChart = () => {
    const baseMax = maxDaily || 1;
    const niceMax = Math.ceil(baseMax / 100) * 100 || 1;
    const barMaxHeight = 120;
    return (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Ionicons name="analytics-outline" size={18} color={Colors.primary.darkTeal} />
          <Text style={styles.chartTitle}>Last 7 Days</Text>
        </View>
        <View style={styles.chartBars}>
          {daily7.map((d) => {
            const rawHeight = d.value > 0 ? Math.max(4, Math.round((d.value / (maxDaily || 1)) * barMaxHeight)) : 0;
            const height = Math.min(barMaxHeight, rawHeight);
            return (
              <View key={d.dateKey} style={styles.chartBarItem}>
                <View style={styles.chartBarTrack}>
                  <View style={[styles.chartBarFill, height > 0 ? { height } : { height: 0 }]} />
                </View>
                <Text style={styles.chartBarValue}>{d.value > 0 ? formatNumber(d.value) : ''}</Text>
                <Text style={styles.chartBarLabel}>{d.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {renderChart()}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumber(totalRecited)}</Text>
          <Text style={styles.statLabel}>Total Recited</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{historyData.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {historyData.length > 0 ? Math.round(totalRecited / historyData.length) : 0}
          </Text>
          <Text style={styles.statLabel}>Avg per Session</Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={styles.modalTitleIcon}>
                <Ionicons name="time-outline" size={18} color={Colors.neutral.white} />
              </View>
              <Text style={styles.modalTitle}>Your History</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.secondary.warmGold} />
              <Text style={styles.loadingText}>Loading your history...</Text>
            </View>
          ) : (
            <FlatList
              data={historyData}
              renderItem={renderHistoryItem}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={historyData.length > 0 ? renderHeader : null}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 15,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.darkGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    marginTop: 16,
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.primary.darkTeal,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary.warmGold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    }),
  },
  historyTypeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIncrement: {
    backgroundColor: Colors.primary.darkTeal,
  },
  badgeBulk: {
    backgroundColor: Colors.secondary.warmGold,
  },
  historyTextBlock: {
    flex: 1,
    paddingHorizontal: 12,
  },
  historyPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
  },
  historySecondary: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    marginTop: 2,
  },
  historyValueBlock: {
    alignItems: 'flex-end',
  },
  historyCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary.warmGold,
  },
  historyValueLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
  },

  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 250,
  },
  // Chart styles
  chartCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 4,
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
    height: 160,
    paddingHorizontal: 4,
  },
  chartBarItem: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarTrack: {
    width: '60%',
    height: 120,
    borderRadius: 8,
    backgroundColor: Colors.neutral.lightGray,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBarFill: {
    width: '100%',
    backgroundColor: Colors.secondary.warmGold,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  chartBarValue: {
    fontSize: 10,
    color: Colors.primary.darkTeal,
    marginTop: 4,
    minHeight: 14,
  },
  chartBarLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    marginTop: 2,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary.darkTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
