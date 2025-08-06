import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useCountdown } from '../hooks/useCountdown';
import { useDuroodCounter } from '../hooks/useDuroodCounter';
import { calculateProgress, formatNumber } from '../utils/helpers';
import { IslamicPattern } from './IslamicPattern';

export function DuroodCounter() {
  const {
    personalCount,
    globalCount,
    isLoading,
    isIncrementing,
    error,
    incrementCount,
    addBulkCount,
    resetError,
    targetCount,
  } = useDuroodCounter();

  const { formattedCountdown } = useCountdown();
  const [buttonScale] = useState(new Animated.Value(1));

  const progress = calculateProgress(globalCount, targetCount);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleIncrement = async () => {
    animateButton();
    try {
      await incrementCount(1);
    } catch {
      Alert.alert('Error', 'Failed to increment count');
    }
  };

  const handleBulkAdd = () => {
    Alert.prompt(
      'Add Bulk Count',
      'Enter the number of Durood recited:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (value) => {
            if (value) {
              const count = parseInt(value, 10);
              if (isNaN(count) || count <= 0) {
                Alert.alert('Error', 'Please enter a valid number');
                return;
              }
              
              if (count > 10000) {
                Alert.alert(
                  'Confirm Large Number',
                  `Are you sure you want to add ${formatNumber(count)} Durood?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes', onPress: () => addBulkCount(count) },
                  ]
                );
              } else {
                await addBulkCount(count);
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <IslamicPattern />
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary.darkTeal} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={Colors.secondary.warmGold} />
              <Text style={styles.loadingText}>صلوا على النبي</Text>
              <Text style={styles.loadingSubtext}>Connecting to the community...</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <IslamicPattern />
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.darkTeal} />
      <SafeAreaView style={styles.safeArea}>
        {/* App Header */}
        <View style={styles.appHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>السلام عليكم</Text>
            <Text style={styles.appTitle}>Durood Counter</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Countdown Section */}
          <View style={styles.countdownSection}>
            <View style={styles.countdownCard}>
              <View style={styles.countdownHeader}>
                <View style={styles.countdownIconContainer}>
                  <Text style={styles.countdownIcon}>🕌</Text>
                </View>
                <View style={styles.countdownInfo}>
                  <Text style={styles.countdownTitle}>Milad un Nabi Countdown</Text>
                  <Text style={styles.countdownSubtitle}>Community Target: 15 Crore</Text>
                </View>
              </View>
              <View style={styles.countdownTimerContainer}>
                <Text style={styles.countdownTime}>{formattedCountdown}</Text>
                <Text style={styles.countdownLabel}>Time Remaining</Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{formatNumber(globalCount)}</Text>
              <Text style={styles.statLabel}>Global Count</Text>
              <Text style={styles.targetText}>🎯 Target: {formatNumber(targetCount)}</Text>
              <View style={styles.progressIndicator}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress.toFixed(1)}% complete</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: Colors.secondary.warmGold }]}>
                {formatNumber(personalCount)}
              </Text>
              <Text style={styles.statLabel}>Your Count</Text>
              <View style={styles.contributionBadge}>
                <Text style={styles.contributionText}>🌟 Active</Text>
              </View>
            </View>
          </View>

          {/* Main Counter Section */}
          <View style={styles.mainSection}>
            {/* Arabic Text */}
            <View style={styles.arabicContainer}>
              <Text style={styles.arabicText}>
                اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ
              </Text>
            </View>

            {/* Counter Display */}
            <View style={styles.counterDisplay}>
              <Text style={styles.counterLabel}>TAP TO COUNT</Text>
              <Animated.View style={[styles.counterButtonContainer, { transform: [{ scale: buttonScale }] }]}>
                <TouchableOpacity
                  style={[styles.counterButton, isIncrementing && styles.counterButtonDisabled]}
                  onPress={handleIncrement}
                  disabled={isIncrementing}
                  activeOpacity={0.7}
                >
                  {isIncrementing ? (
                    <ActivityIndicator size="large" color={Colors.neutral.white} />
                  ) : (
                    <Text style={styles.counterButtonText}>+1</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
              <Text style={styles.counterHint}>Long press for quick add</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleBulkAdd}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonIcon}>
                  <Text style={styles.actionButtonEmoji}>📝</Text>
                </View>
                <Text style={styles.actionButtonText}>Bulk Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => Alert.alert('History', 'History feature coming soon!')}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonIcon}>
                  <Text style={styles.actionButtonEmoji}>📊</Text>
                </View>
                <Text style={styles.actionButtonText}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => Alert.alert('Share', 'Share feature coming soon!')}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonIcon}>
                  <Text style={styles.actionButtonEmoji}>📤</Text>
                </View>
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={resetError} style={styles.errorButton}>
                <Text style={styles.errorButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.darkTeal,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    marginTop: 8,
    textAlign: 'center',
  },
  // App Header
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary.darkTeal,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.mediumTeal,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: Colors.neutral.white,
    opacity: 0.8,
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.white,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.mediumTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
  },
  // Countdown Section
  countdownSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  countdownCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.warmGold,
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary.lightTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  countdownIcon: {
    fontSize: 24,
  },
  countdownInfo: {
    flex: 1,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
    marginBottom: 2,
  },
  countdownSubtitle: {
    fontSize: 13,
    color: Colors.neutral.darkGray,
    opacity: 0.8,
  },
  countdownTimerContainer: {
    backgroundColor: Colors.primary.lightTeal,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  countdownTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
    marginBottom: 4,
    textAlign: 'center',
  },
  countdownLabel: {
    fontSize: 12,
    color: Colors.primary.darkTeal,
    opacity: 0.8,
    textAlign: 'center',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    marginBottom: 8,
  },
  targetText: {
    fontSize: 11,
    color: Colors.secondary.warmGold,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  progressIndicator: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary.warmGold,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
  },
  contributionBadge: {
    backgroundColor: Colors.secondary.warmGold,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  contributionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
  },
  // Main Section
  mainSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightGray,
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 24,
  },
  arabicContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  arabicText: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.primary.darkTeal,
    textAlign: 'center',
    lineHeight: 32,
  },
  // Counter Display
  counterDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  counterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.neutral.darkGray,
    marginBottom: 16,
    letterSpacing: 1.2,
  },
  counterButtonContainer: {
    marginBottom: 12,
  },
  counterButton: {
    backgroundColor: Colors.secondary.warmGold,
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: Colors.neutral.white,
  },
  counterButtonDisabled: {
    opacity: 0.7,
  },
  counterButtonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
  },
  counterHint: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontStyle: 'italic',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    minWidth: 80,
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonEmoji: {
    fontSize: 24,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary.darkTeal,
    textAlign: 'center',
  },
  // Error Display
  errorContainer: {
    backgroundColor: Colors.functional.error,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.neutral.white,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorButtonText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '500',
  },
}); 