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
import { HistoryEntry, historyService } from '../services/historyService';
import { formatNumber } from '../utils/helpers';

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export function HistoryModal({ visible, onClose }: HistoryModalProps) {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecited, setTotalRecited] = useState(0);

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

  const getTypeIcon = (type: 'increment' | 'bulk') => {
    return type === 'increment' ? '📿' : '📝';
  };

  const getTypeText = (type: 'increment' | 'bulk') => {
    return type === 'increment' ? 'Tally Counter' : 'Bulk Add';
  };

  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyItemHeader}>
        <View style={styles.historyTypeContainer}>
          <Text style={styles.historyTypeIcon}>{getTypeIcon(item.type)}</Text>
          <Text style={styles.historyTypeText}>{getTypeText(item.type)}</Text>
        </View>
        <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
      </View>
      
      <View style={styles.historyItemContent}>
        <Text style={styles.historyCount}>+{formatNumber(item.count)}</Text>
        <Text style={styles.historyLabel}>Durood Recited</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📊</Text>
      <Text style={styles.emptyStateTitle}>No History Yet</Text>
      <Text style={styles.emptyStateText}>
        Start reciting Durood to see your history here
      </Text>
    </View>
  );

  const renderHeader = () => (
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
            <Text style={styles.modalTitle}>📊 Your History</Text>
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
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.warmGold,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  historyTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontWeight: '500',
  },
  historyItemContent: {
    alignItems: 'center',
  },
  historyCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary.warmGold,
    marginBottom: 4,
  },
  historyLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
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
});
