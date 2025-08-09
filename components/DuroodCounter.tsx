import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
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
import Svg, { Circle, Defs, Line, Path, Rect, Stop, LinearGradient as SvgLinearGradient, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { useCountdown } from '../hooks/useCountdown';
import { useDuroodCounter } from '../hooks/useDuroodCounter';
import { firebaseService } from '../services/firebaseService';
import { computeNiceMax125 } from '../services/globalStatsService';
import { buildLastNDaysBuckets, computeNiceMax, historyService } from '../services/historyService';
import { calculateProgress, formatNumber } from '../utils/helpers';
import { HistoryModal } from './HistoryModal';
import { IslamicPattern } from './IslamicPattern';

export function DuroodCounter() {
  const {
    personalCount,
    globalCount,
    isLoading,
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [daily7, setDaily7] = useState<{ label: string; dateKey: string; value: number }[]>([]);
  const [maxDaily, setMaxDaily] = useState(0);
  const [windowKey, setWindowKey] = useState<string | null>(null);
  const [globalBuckets, setGlobalBuckets] = useState<{ label: string; dateKey: string; value: number }[]>([]);
  const [globalMax, setGlobalMax] = useState(1);

  // Get screen dimensions for responsive positioning
  const screenWidth = Dimensions.get('window').width;
  const missionCardPadding = 32; // 16px margin on each side
  const cardWidth = screenWidth - missionCardPadding;

  // Calculate center position for background logo
  const logoSize = Math.min(cardWidth * 0.8, 320); // Increased from 60% to 80% of card width, max 320px
  const logoLeft = (cardWidth - logoSize) / 2;

  const progress = calculateProgress(globalCount, targetCount);

  // Set navigation bar color on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(Colors.primary.darkTeal);
    }
  }, []);

  // Load 7-day personal history for contribution chart
  useEffect(() => {
    const loadSevenDay = async () => {
      try {
        const history = await historyService.getHistory();
        const days = buildLastNDaysBuckets(history, 7);
        // Optimistically include increments reflected in personalCount but not yet in history
        const historyTotal = history.reduce((sum, h) => sum + h.count, 0);
        const pendingDelta = Math.max(0, personalCount - historyTotal);
        if (pendingDelta > 0 && days.length > 0) {
          const last = days.length - 1;
          days[last] = { ...days[last], value: days[last].value + pendingDelta };
        }
        setDaily7(days);
        const firstKey = days[0]?.dateKey ?? '';
        const lastKey = days[days.length - 1]?.dateKey ?? '';
        const nextWindowKey = `${firstKey}_${lastKey}`;
        if (windowKey !== nextWindowKey) {
          setWindowKey(nextWindowKey);
          setMaxDaily(computeNiceMax(days));
        }
      } catch {
        // noop
      }
    };
    loadSevenDay();
    // Recompute if personalCount changes or when bucketing window changes
  }, [personalCount, windowKey]);

  // Subscribe to realtime dailyCounts from Firebase for accurate per-day global graph
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToDailyCounts((map) => {
      const today = new Date();
      const out: { label: string; dateKey: string; value: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const y = d.getUTCFullYear();
        const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = d.getUTCDate().toString().padStart(2, '0');
        const key = `${y}-${m}-${day}`;
        const label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
        out.push({ label, dateKey: key, value: map[key] || 0 });
      }
      setGlobalBuckets(out);
      setGlobalMax(computeNiceMax125(out.map((b) => b.value)) || 1);
    });
    return unsubscribe;
  }, []);

  const handleSettingsPress = () => {
    router.push('/settings');
  };

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
              } catch {
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
      } catch {
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
            <Image
              source={require('../assets/images/celebration-logo.png')}
              style={styles.celebrationLogo}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>

              <Text style={styles.appTitle}>Durood Counter</Text>
              <Text style={styles.greeting}>An Initiative by SDI</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={handleSettingsPress}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={Colors.neutral.white}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mission Section */}
          <View style={styles.missionSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLine} />
              <Text style={styles.sectionHeaderText}>Global Mission</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
            <View style={styles.missionCard}>
              <Image
                source={require('../assets/images/sdi logo arabic.png')}
                style={[
                  styles.missionBackgroundLogo,
                  {
                    width: logoSize,
                    height: logoSize,
                    left: logoLeft,
                    top: '27.5%',
                    marginTop: -logoSize / 2,
                  }
                ]}
                resizeMode="contain"
              />
              <View style={styles.missionHeader}>
                <View style={styles.missionHeaderTop}>
                  <Text style={styles.missionTitle}>Global Mission</Text>
                </View>
                <Text style={styles.missionGoal}>15 Crore Durood for Milad un Nabi ﷺ</Text>
                <View style={styles.missionGoalAccent} />
                <View style={styles.missionInitiativePill}>
                  <Text style={styles.missionInitiativeText}>
                    An Initiative by Sunni Dawate Islami for the celebration of 1500th Milad un Nabi ﷺ
                  </Text>
                </View>
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

              <View style={styles.timerCard}>
                <View style={styles.timerHeaderRow}>
                  <View style={styles.timerBadge}>
                    <Ionicons name="time-outline" size={16} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.timerTitle}>Time to Milad un Nabi ﷺ</Text>
                </View>
                <View style={styles.timerGrid}>
                  {formattedCountdown.split(':').map((seg, idx) => (
                    <View key={idx} style={styles.timerCell}>
                      <Text style={styles.timerNumber}>{seg}</Text>
                      <Text style={styles.timerUnit}>{['Days', 'Hours', 'Minutes', 'Seconds'][idx]}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {/* Global 7-day Graph (inside mission card) */}
              <View style={styles.globalChartCard}>
                <View style={styles.chartHeader}>
                  <Ionicons name="earth-outline" size={18} color={Colors.primary.darkTeal} />
                  <Text style={styles.chartTitle}>Global (Last 7 Days)</Text>
                </View>
                <GlobalLineChart buckets={globalBuckets} maxValue={globalMax} />
              </View>
            </View>
            {/* Close missionSection */}
          </View>

          {/* Personal Stats */}
          <View style={styles.personalStatsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLine} />
              <Text style={styles.sectionHeaderText}>Your Progress</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
            <ImageBackground
              source={require('../assets/images/islamic-background90.jpg')}
              style={styles.personalStatCard}
              imageStyle={styles.personalStatBackgroundImage}
              resizeMode={'cover'}
            >
              <Text style={styles.personalStatTitle}>Your Contribution</Text>
              <Text style={styles.personalStatNumber}>{formatNumber(personalCount)}</Text>
              <Text style={styles.personalStatLabel}>Durood Recited</Text>
              <View style={styles.contributionBadge}>
                <Text style={styles.contributionText}>🌟 Keep Going!</Text>
              </View>
              {/* 7-day chart (same as history) */}
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Ionicons name="analytics-outline" size={18} color={Colors.primary.darkTeal} />
                  <Text style={styles.chartTitle}>Last 7 Days</Text>
                </View>
                <View style={styles.chartBars}>
                  {daily7.map((d) => {
                    const niceMax = maxDaily || 1;
                    const barMaxHeight = 120;
                    const rawHeight = d.value > 0 ? Math.max(4, Math.round((d.value / niceMax) * barMaxHeight)) : 0;
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
            </ImageBackground>
          </View>

          {/* Main Counter Section */}
          <View style={styles.counterSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLine} />
              <Text style={styles.sectionHeaderText}>Recite Durood</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
            <ImageBackground
              source={require('../assets/images/recitedurood background.png')}
              style={styles.mainSection}
              imageStyle={styles.mainSectionBackgroundImage}
              resizeMode={'cover'}
            >
              <View style={styles.mainSectionWhiteOverlay} pointerEvents="none" />
              {/* Arabic Text */}
              <View style={styles.arabicContainer}>
                <Text
                  style={styles.arabicText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ ﷺ
                </Text>
              </View>

              {/* Counter Display */}
              <View style={styles.counterDisplay}>
                <Text style={styles.counterLabel}>TAP TO COUNT</Text>
                <Animated.View style={[styles.counterButtonContainer, { transform: [{ scale: buttonScale }] }]}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={handleIncrement}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.counterButtonText}>+1</Text>
                  </TouchableOpacity>
                </Animated.View>

                <Text style={styles.verseText} accessibilityRole="text">
                  إِنَّ ٱللَّهَ وَمَلَـٰٓئِكَتَهُۥ يُصَلُّونَ عَلَى ٱلنَّبِىِّ ۚ يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ صَلُّوا۟ عَلَيْهِ وَسَلِّمُوا۟ تَسْلِيمًا
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleBulkAdd}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonIcon}>
                    <Ionicons name="cloud-upload-outline" size={26} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionButtonText}>Bulk Add</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowHistoryModal(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonIcon}>
                    <Ionicons name="time-outline" size={26} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionButtonText}>History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Share', 'Share feature coming soon!')}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonIcon}>
                    <Ionicons name="share-social-outline" size={26} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setShowCharityModal(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionButtonIcon}>
                    <Ionicons name="heart-outline" size={26} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionButtonText}>Charity</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
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


        {/* Bulk Add Overlay */}
        {showBulkModal && (
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
        )}

        {/* History Modal */}
        <HistoryModal
          visible={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          personalCount={personalCount}
        />

        {/* Charity Overlay */}
        {showCharityModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.charityModalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🤲 Charity Details</Text>
                <Text style={styles.modalSubtitle}>Support Madrasa Ummul Khair Lilbanaat</Text>
              </View>

              <ScrollView contentContainerStyle={styles.charityContent}>
                <Text style={styles.charityLine}>
                  Madrasa Ummul Khair Lilbanaat @ 1st Floor, SDI YOUTH CENTER, Markaz Sunni Dawate Islami branch Gulbarga
                </Text>
                <Text style={styles.charityLine}>
                  A/C Name: Sunni Dawat-E-Islami Education & Charitable Trust Gulbarga
                </Text>
                <Text style={styles.charityLine}>Bank: State Bank Of India</Text>
                <Text style={styles.charityLine}>Account No.: 62179881380</Text>
                <Text style={styles.charityLine}>IFSC: SBIN0020632 (Dargah Branch, Gulbarga)</Text>

                <View style={styles.qrContainer}>
                  <Image
                    source={require('../assets/images/QR Code.jpg')}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrCaption}>Scan to Donate</Text>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowCharityModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

interface GlobalLineChartProps {
  buckets: { label: string; dateKey: string; value: number }[];
  maxValue: number;
}

const GlobalLineChart = React.memo(function GlobalLineChart({ buckets, maxValue }: GlobalLineChartProps) {
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const height = 190;
  const padding = 8; // right padding
  const paddingLeft = 4; // small left padding
  const leftAxis = 24; // y labels width
  const bottomLabelSpace = 22; // space reserved for x labels
  const width = Math.max(0, containerWidth);
  const plotLeft = paddingLeft + leftAxis;
  const innerW = Math.max(0, width - padding - plotLeft);
  const innerH = Math.max(0, height - padding * 2 - bottomLabelSpace);

  const max = Math.max(1, maxValue);
  const n = buckets.length;
  const stepX = React.useMemo(() => (n > 1 ? innerW / (n - 1) : 0), [n, innerW]);

  const points = React.useMemo(() => {
    return buckets.map((b, i) => {
      const x = plotLeft + (n > 1 ? i * stepX : innerW / 2);
      const y = padding + (1 - Math.min(1, b.value / max)) * innerH;
      return { x, y, v: b.value, label: b.label, key: b.dateKey };
    });
  }, [buckets, n, stepX, innerH, max, plotLeft, innerW]);

  // Smooth path using a simple Catmull-Rom to Bezier conversion
  const pathD = React.useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    const d: string[] = [];
    d.push(`M ${points[0].x} ${points[0].y}`);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const smooth = 0.2;
      const cp1x = p1.x + (p2.x - p0.x) * smooth;
      const cp1y = p1.y + (p2.y - p0.y) * smooth;
      const cp2x = p2.x - (p3.x - p1.x) * smooth;
      const cp2y = p2.y - (p3.y - p1.y) * smooth;
      d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
    }
    return d.join(' ');
  }, [points]);

  // Y-axis ticks (0, 1/3, 2/3, max)
  const t1 = Math.round(max / 3);
  const t2 = Math.round((2 * max) / 3);
  const yTicks = [0, t1, t2, max];

  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const lastXRef = React.useRef<number>(0);
  const handlePointFromX = React.useCallback((x: number) => {
    if (n === 0) return null;
    const relX = Math.max(plotLeft, Math.min(plotLeft + innerW, x));
    const idx = n > 1 ? Math.round((relX - plotLeft) / stepX) : 0;
    return Math.max(0, Math.min(n - 1, idx));
  }, [n, innerW, stepX, plotLeft]);

  const scheduleUpdate = React.useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const idx = handlePointFromX(lastXRef.current);
      if (idx !== null && idx !== hoverIdx) setHoverIdx(idx);
    });
  }, [handlePointFromX, hoverIdx]);

  const onMove = (evt: any) => {
    const { locationX } = evt.nativeEvent || {};
    lastXRef.current = locationX || 0;
    scheduleUpdate();
  };
  const onLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setHoverIdx(null);
  };

  return (
    <View style={styles.globalLineChartContainer} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.secondary.warmGold} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={Colors.secondary.warmGold} stopOpacity="0" />
          </SvgLinearGradient>
          <SvgLinearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor={Colors.secondary.warmGold} />
            <Stop offset="100%" stopColor={Colors.primary.darkTeal} />
          </SvgLinearGradient>
        </Defs>
        {/* Grid and Y-axis labels */}
        <Rect x={plotLeft} y={padding} width={innerW} height={innerH} rx={8} fill={Platform.OS === 'web' ? 'rgba(0,0,0,0.03)' : 'transparent'} />
        {yTicks.map((t, i) => {
          const y = padding + (1 - Math.min(1, t / max)) * innerH;
          return (
            <React.Fragment key={`yt-${i}`}>
              <Line x1={plotLeft} y1={y} x2={plotLeft + innerW} y2={y} stroke={Colors.primary.darkTeal} strokeOpacity={0.06} strokeWidth={1} />
              <SvgText x={paddingLeft + 2} y={y + 4} fill={Colors.neutral.darkGray} fontSize={10}>
                {formatNumber(t)}
              </SvgText>
            </React.Fragment>
          );
        })}
        {points.length > 1 && (
          <Path
            d={`${pathD} L ${plotLeft + innerW} ${padding + innerH} L ${plotLeft} ${padding + innerH} Z`}
            fill="url(#glow)"
          />
        )}
        {/* Line with gradient stroke and shadow */}
        <Path d={pathD} stroke={Colors.primary.darkTeal} strokeOpacity={0.08} strokeWidth={6} fill="none" />
        <Path d={pathD} stroke="url(#strokeGrad)" strokeWidth={2.5} fill="none" />
        {points.map((p) => (
          <React.Fragment key={`pt-${p.key}`}>
            <Circle cx={p.x} cy={p.y} r={6} fill={Colors.neutral.white} fillOpacity={0.8} />
            <Circle cx={p.x} cy={p.y} r={3} fill={Colors.secondary.warmGold} />
          </React.Fragment>
        ))}
        {/* Interaction overlay for mouse/touch */}
        <Rect
          x={plotLeft}
          y={padding}
          width={innerW}
          height={innerH}
          fill="transparent"
          {...({ onMouseMove: onMove, onMouseLeave: onLeave } as any)}
          onStartShouldSetResponder={() => true}
          onResponderGrant={onMove}
          onResponderMove={onMove}
          onResponderRelease={onLeave}
        />
        {hoverIdx !== null && points[hoverIdx] && (
          <>
            <Line
              x1={points[hoverIdx].x}
              y1={padding}
              x2={points[hoverIdx].x}
              y2={padding + innerH}
              stroke={Colors.primary.darkTeal}
              strokeOpacity={0.25}
              strokeWidth={1}
            />
            <Circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r={5} fill={Colors.secondary.warmGold} />
            {(() => {
              const p = points[hoverIdx];
              const valueText = `${formatNumber(p.v)}`;
              const bubbleW = Math.max(60, valueText.length * 9);
              const bubbleH = 28;
              const bx = Math.max(plotLeft, Math.min(p.x - bubbleW / 2, plotLeft + innerW - bubbleW));
              const by = Math.max(padding, p.y - bubbleH - 10);
              return (
                <>
                  <Rect x={bx} y={by} width={bubbleW} height={bubbleH} rx={6} fill={Colors.primary.darkTeal} />
                  <SvgText
                    x={bx + bubbleW / 2}
                    y={by + bubbleH / 2 + 4}
                    fill={Colors.neutral.white}
                    fontSize={12}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {valueText}
                  </SvgText>
                </>
              );
            })()}
          </>
        )}
        {/* X-axis day labels centered under points */}
        {points.map((p) => (
          <SvgText
            key={`lbl-${p.key}`}
            x={p.x}
            y={height - padding - 6}
            fill={Colors.neutral.darkGray}
            fontSize={10}
            textAnchor="middle"
          >
            {p.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}, (prev, next) => {
  if (prev.maxValue !== next.maxValue) return false;
  if (prev.buckets.length !== next.buckets.length) return false;
  for (let i = 0; i < prev.buckets.length; i++) {
    const a = prev.buckets[i];
    const b = next.buckets[i];
    if (a.dateKey !== b.dateKey || a.value !== b.value) return false;
  }
  return true;
});

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
  scrollViewContent: {
    paddingBottom: 30,
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
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    }),
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
    paddingVertical: 10,
    backgroundColor: Colors.primary.darkTeal,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.mediumTeal,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  celebrationLogo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerTextContainer: {
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
    paddingTop: 16, // Standardized to 16
    paddingBottom: 16, // Keep consistent
  },
  missionCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 10,
    }),
  },
  missionBackgroundLogo: {
    position: 'absolute',
    opacity: 0.08,
    zIndex: 0,
  },
  missionHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(45, 74, 74, 0.3)', // Colors.primary.darkTeal with 0.3 opacity
    position: 'relative',
    zIndex: 1,
  },
  missionHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary.darkTeal,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  missionGoal: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary.darkTeal,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.2,
    marginTop: 4,
  },
  missionGoalAccent: {
    width: 64,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.secondary.warmGold,
    marginTop: 6,
    marginBottom: 10,
  },
  missionInitiative: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    // textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    opacity: 0.9,

  },
  missionInitiativePill: {
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  missionInitiativeText: {
    fontSize: 11,
    color: Colors.primary.darkTeal,
    textAlign: 'center',
  },
  missionProgress: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
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
    width: 2,
    backgroundColor: Colors.primary.darkTeal,
    marginHorizontal: 16,
    opacity: 0.3,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.primary.darkTeal,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
    opacity: 0.2,
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
    borderWidth: 1,
    borderColor: Colors.secondary.warmGold,
    position: 'relative',
    zIndex: 1,
    marginTop: 16,

  },
  timerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary.warmGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  // New timer card styles
  timerCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    }),
  },
  timerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timerBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary.darkTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  timerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary.darkTeal,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  timerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 4,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  timerNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary.darkTeal,
  },
  timerUnit: {
    marginTop: 2,
    fontSize: 10,
    color: Colors.neutral.darkGray,
  },
  // Personal Stats Section
  personalStatsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16, // Standardized to 16
  },
  personalStatCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 6,
    }),
  },
  // Reuse chart styles from HistoryModal for consistency
  chartCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginTop: 8,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
    height: 180,
    paddingHorizontal: 4,
    width: '100%',
  },
  chartBarItem: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarTrack: {
    width: '60%',
    height: 140,
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
    fontSize: 11,
    color: Colors.neutral.darkGray,
    marginTop: 2,
  },
  // Global chart styles (reuse, slightly larger)
  globalChartCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 12,
    marginTop: 26,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    }),
  },
  globalLineChartContainer: {
    width: '100%',
  },
  globalChartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
    height: 180,
    paddingHorizontal: 4,
    width: '100%',
  },
  globalLineLabelsRow: {
  },
  globalLineLabelCell: {
  },
  globalChartBarTrack: {
    width: '60%',
    height: 140,
    borderRadius: 8,
    backgroundColor: Colors.neutral.lightGray,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  globalChartBarFill: {
    width: '100%',
    backgroundColor: Colors.primary.darkTeal,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  personalStatBackgroundImage: {
    opacity: 0.28,
    transform: [{ scale: 1.0 }],
    borderRadius: 16,
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
    marginTop: 5,
    marginBottom: 8,
  },
  contributionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
  },
  // Counter Section
  counterSection: {
    paddingHorizontal: 16,
    paddingTop: 16, // Reduced from 24 to match other sections
    paddingBottom: 16, // Standardized to 16
  },
  // Main Section
  mainSection: {
    flex: 1,
    paddingHorizontal: 16, // Changed from 20 to match other sections
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    marginHorizontal: 0, // Removed margin since counterSection now handles padding
    marginTop: 0, // Changed from 8 to 0 to bring closer to heading
    borderRadius: 24,
    overflow: 'hidden',
  },
  mainSectionBackgroundImage: {
    opacity: 0.6,
    transform: [{ scale: 1.0 }],
    borderRadius: 24,
  },
  mainSectionWhiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24,
  },
  arabicContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  arabicText: {
    fontSize: 20,
    fontWeight: '700',
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
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    }),
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
  verseText: {
    fontSize: 16,
    color: Colors.primary.darkTeal,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 26,
    fontWeight: '700',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.darkTeal,
    borderWidth: 1,
    borderColor: Colors.secondary.warmGold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }),
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 15,
    }),
  },
  charityModalContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: 480,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 15,
    }),
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
  charityContent: {
    padding: 20,
    gap: 8,
  },
  charityLine: {
    fontSize: 14,
    color: Colors.primary.darkTeal,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  qrImage: {
    width: 240,
    height: 240,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  qrCaption: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.neutral.darkGray,
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
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    }),
  },
  modalConfirmButtonDisabled: {
    backgroundColor: Colors.neutral.mediumGray,
    ...(Platform.OS === 'web' ? {
      boxShadow: 'none',
    } : {
      shadowOpacity: 0,
      elevation: 0,
    }),
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
  },
}); 