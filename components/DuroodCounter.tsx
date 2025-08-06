import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCountInput, setBulkCountInput] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

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
    setShowBulkModal(true);
    setBulkCountInput('');
  };

  const handleBulkSubmit = async () => {
    const count = parseInt(bulkCountInput.trim(), 10);
    
    if (isNaN(count) || count <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number greater than 0');
      return;
    }

    if (count > 50000) {
      Alert.alert(
        'Large Number Warning',
        `Are you sure you want to add ${formatNumber(count)} Durood? This is a very large number.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Confirm', 
            onPress: async () => {
              setIsBulkProcessing(true);
              try {
                await addBulkCount(count);
                setShowBulkModal(false);
                setBulkCountInput('');
              } catch (error) {
                Alert.alert('Error', 'Failed to add bulk count');
              } finally {
                setIsBulkProcessing(false);
              }
            }
          },
        ]
      );
    } else {
      setIsBulkProcessing(true);
      try {
        await addBulkCount(count);
        setShowBulkModal(false);
        setBulkCountInput('');
      } catch (error) {
        Alert.alert('Error', 'Failed to add bulk count');
      } finally {
        setIsBulkProcessing(false);
      }
    }
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setBulkCountInput('');
  };

  if (isLoading) {
    return (
        <View style={styles.container}>
        <IslamicPattern />
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={Colors.primary.darkTeal}
          translucent={false}
          {...(Platform.OS === 'android' && {
            navigationBarColor: Colors.primary.darkTeal,
            navigationBarStyle: 'light-content',
          })}
        />
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
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Colors.primary.darkTeal}
        translucent={false}
        {...(Platform.OS === 'android' && {
          navigationBarColor: Colors.primary.darkTeal,
          navigationBarStyle: 'light-content',
        })}
      />
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
          {/* Mission Section */}
          <View style={styles.missionSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLine} />
              <Text style={styles.sectionHeaderText}>Global Mission</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
            <View style={styles.missionCard}>
              <View style={styles.missionHeader}>
                <Text style={styles.missionTitle}>🎯 Global Mission</Text>
                <Text style={styles.missionGoal}>15 Crore Durood for Milad un Nabi</Text>
              </View>
              
              <View style={styles.missionProgress}>
                <View style={styles.progressStats}>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressNumber}>{formatNumber(globalCount)}</Text>
                    <Text style={styles.progressLabel}>Completed</Text>
                  </View>
                  <View style={styles.progressDivider} />
                  <View style={styles.progressItem}>
                    <Text style={styles.progressNumber}>{formatNumber(targetCount - globalCount)}</Text>
                    <Text style={styles.progressLabel}>Remaining</Text>
                  </View>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressPercentage}>{progress.toFixed(2)}% Complete</Text>
                </View>
              </View>

              <View style={styles.timerSection}>
                <View style={styles.timerIcon}>
                  <Text style={styles.timerEmoji}>⏰</Text>
                </View>
                <View style={styles.timerContent}>
                  <Text style={styles.timerLabel}>Time to Milad un Nabi</Text>
                  <Text style={styles.timerValue}>{formattedCountdown}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Personal Stats */}
          <View style={styles.personalStatsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLine} />
              <Text style={styles.sectionHeaderText}>Your Progress</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
            <View style={styles.personalStatCard}>
              <Text style={styles.personalStatTitle}>Your Contribution</Text>
              <Text style={styles.personalStatNumber}>{formatNumber(personalCount)}</Text>
              <Text style={styles.personalStatLabel}>Durood Recited</Text>
              <View style={styles.contributionBadge}>
                <Text style={styles.contributionText}>🌟 Keep Going!</Text>
              </View>
            </View>
          </View>

          {/* Main Counter Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLine} />
            <Text style={styles.sectionHeaderText}>Recite Durood</Text>
            <View style={styles.sectionHeaderLine} />
          </View>
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

        {/* Bulk Add Modal */}
        <Modal
          visible={showBulkModal}
          transparent={true}
          animationType="fade"
          onRequestClose={closeBulkModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📝 Add Bulk Count</Text>
                <Text style={styles.modalSubtitle}>Enter the number of Durood you have recited</Text>
              </View>

              <View style={styles.modalContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Number of Durood</Text>
                  <TextInput
                    style={styles.bulkInput}
                    value={bulkCountInput}
                    onChangeText={setBulkCountInput}
                    placeholder="Enter count..."
                    placeholderTextColor={Colors.neutral.mediumGray}
                    keyboardType="numeric"
                    autoFocus={true}
                    maxLength={10}
                  />
                  {bulkCountInput && !isNaN(parseInt(bulkCountInput)) && (
                    <Text style={styles.inputHint}>
                      Adding: {formatNumber(parseInt(bulkCountInput))} Durood
                    </Text>
                  )}
                </View>

                <View style={styles.quickAmounts}>
                  <Text style={styles.quickAmountsLabel}>Quick Select:</Text>
                  <View style={styles.quickAmountButtons}>
                    {[33, 100, 300, 500, 1000].map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        style={styles.quickAmountButton}
                        onPress={() => setBulkCountInput(amount.toString())}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quickAmountText}>{amount}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={closeBulkModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmButton,
                    (!bulkCountInput || isNaN(parseInt(bulkCountInput)) || parseInt(bulkCountInput) <= 0) && styles.modalConfirmButtonDisabled
                  ]}
                  onPress={handleBulkSubmit}
                  disabled={!bulkCountInput || isNaN(parseInt(bulkCountInput)) || parseInt(bulkCountInput) <= 0 || isBulkProcessing}
                  activeOpacity={0.8}
                >
                  {isBulkProcessing ? (
                    <ActivityIndicator size="small" color={Colors.neutral.white} />
                  ) : (
                    <Text style={styles.modalConfirmText}>Add Count</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.secondary.warmGold,
    opacity: 0.3,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    marginHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Mission Section
  missionSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  missionCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  missionHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
    marginBottom: 4,
    textAlign: 'center',
  },
  missionGoal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary.warmGold,
    textAlign: 'center',
  },
  missionProgress: {
    marginBottom: 20,
  },
  progressStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontWeight: '500',
  },
  progressDivider: {
    width: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginHorizontal: 16,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.secondary.warmGold,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.darkTeal,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.secondary.warmGold,
  },
  timerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary.warmGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timerEmoji: {
    fontSize: 24,
  },
  timerContent: {
    flex: 1,
  },
  timerLabel: {
    fontSize: 12,
    color: Colors.neutral.white,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.9,
  },
  timerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary.warmGold,
  },
  // Personal Stats Section
  personalStatsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  personalStatCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderTopWidth: 3,
    borderTopColor: Colors.secondary.warmGold,
  },
  personalStatTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
    marginBottom: 8,
    textAlign: 'center',
  },
  personalStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.secondary.warmGold,
    marginBottom: 4,
  },
  personalStatLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    marginBottom: 12,
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
    marginTop: 16,
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
  // Bulk Add Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContent: {
    padding: 24,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
    marginBottom: 8,
  },
  bulkInput: {
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.secondary.warmGold,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  quickAmounts: {
    marginBottom: 8,
  },
  quickAmountsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
    marginBottom: 12,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.mediumGray,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.mediumGray,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.darkGray,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: Colors.secondary.warmGold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalConfirmButtonDisabled: {
    backgroundColor: Colors.neutral.mediumGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
  },
}); 