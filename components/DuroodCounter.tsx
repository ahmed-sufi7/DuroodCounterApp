import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { useCountdown } from '../hooks/useCountdown';
import { useDuroodCounter } from '../hooks/useDuroodCounter';
import { calculateProgress, formatNumber } from '../utils/helpers';

const { width, height } = Dimensions.get('window');

interface AnimationRefs {
  scaleAnim: Animated.Value;
  fadeAnim: Animated.Value;
  rotateAnim: Animated.Value;
  pulseAnim: Animated.Value;
}

const IslamicPattern: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Polygon
      points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
      fill={color}
      opacity={0.1}
    />
    <Circle cx="50" cy="50" r="25" fill="none" stroke={color} strokeWidth="1" opacity={0.2} />
    <Circle cx="50" cy="50" r="15" fill="none" stroke={color} strokeWidth="1" opacity={0.3} />
  </Svg>
);

const GeometricBorder: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
    <Path
      d={`M10,10 L${width-10},10 L${width-10},${height-10} L10,${height-10} Z`}
      fill="none"
      stroke="rgba(212, 175, 55, 0.3)"
      strokeWidth="2"
      strokeDasharray="5,5"
    />
  </Svg>
);

const ProfessionalCard: React.FC<{
  children: React.ReactNode;
  style?: any;
  gradient?: readonly [string, string];
}> = ({ children, style, gradient = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] as const }) => (
  <View style={[styles.cardContainer, style]}>
    <LinearGradient colors={gradient} style={styles.cardGradient}>
      <GeometricBorder width={style?.width || width - 40} height={style?.height || 'auto'} />
      {children}
    </LinearGradient>
  </View>
);

const IslamicHeader: React.FC = () => (
  <View style={styles.headerContainer}>
    <View style={styles.headerPattern}>
      <IslamicPattern size={60} color="#d4af37" />
    </View>
    <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
    <Text style={styles.headerTitle}>صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا</Text>
    <Text style={styles.headerSubtitle}>Durood Shareef Counter</Text>
    <View style={styles.decorativeLine}>
      <View style={styles.lineSegment} />
      <IslamicPattern size={20} color="#d4af37" />
      <View style={styles.lineSegment} />
    </View>
    <Text style={styles.mawlidText}>Mawlid un Nabi 1446 AH • 2025 CE</Text>
  </View>
);

const ProgressRing: React.FC<{
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
}> = ({ progress, size, strokeWidth, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg width={size} height={size} style={styles.progressRing}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={strokeWidth}
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};

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
  const progress = calculateProgress(globalCount, targetCount);

  const animations: AnimationRefs = {
    scaleAnim: useRef(new Animated.Value(1)).current,
    fadeAnim: useRef(new Animated.Value(1)).current,
    rotateAnim: useRef(new Animated.Value(0)).current,
    pulseAnim: useRef(new Animated.Value(1)).current,
  };

  // Calculate days until Mawlid un Nabi 2025
  const targetDate = new Date('2025-09-05');
  const today = new Date();
  const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    // Continuous rotation animation for decorative elements
    Animated.loop(
      Animated.timing(animations.rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for the main counter
    Animated.loop(
      Animated.sequence([
        Animated.timing(animations.pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animations.pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleTallyPress = async (): Promise<void> => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Button press animations
    Animated.parallel([
      Animated.sequence([
        Animated.timing(animations.scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animations.scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(animations.fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animations.fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    await incrementCount(1);
  };

  const handleBulkAdd = (): void => {
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

  const spin = animations.rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f3818" />
        <LinearGradient
          colors={['#0f3818', '#1a472a', '#2d5a3d', '#1a472a', '#0f3818']}
          style={styles.gradient}
          locations={[0, 0.25, 0.5, 0.75, 1]}
        >
          <View style={styles.loadingContainer}>
            <ProfessionalCard style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#d4af37" />
              <Text style={styles.loadingText}>Loading Durood Counter</Text>
              <Text style={styles.loadingSubtext}>Connecting to the community...</Text>
            </ProfessionalCard>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f3818" />
      
      <LinearGradient
        colors={['#0f3818', '#1a472a', '#2d5a3d', '#1a472a', '#0f3818']}
        style={styles.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Animated Background Pattern */}
          <Animated.View style={[styles.backgroundPattern, { transform: [{ rotate: spin }] }]}>
            <IslamicPattern size={200} color="#d4af37" />
          </Animated.View>

          <IslamicHeader />

          {/* Global Progress Section */}
          <ProfessionalCard style={styles.globalCard}>
            <View style={styles.globalHeader}>
              <Text style={styles.sectionTitle}>Global Ummah Progress</Text>
              <Text style={styles.globalSubtitle}>United in Salawat</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressRingContainer}>
                <ProgressRing
                  progress={progress}
                  size={120}
                  strokeWidth={8}
                  color="#d4af37"
                />
                <View style={styles.progressCenter}>
                  <Text style={styles.progressPercentage}>{progress.toFixed(1)}%</Text>
                  <Text style={styles.progressLabel}>Complete</Text>
                </View>
              </View>
              
              <View style={styles.progressStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatNumber(globalCount)}</Text>
                  <Text style={styles.statLabel}>Current</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatNumber(targetCount)}</Text>
                  <Text style={styles.statLabel}>Target</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{daysLeft}</Text>
                  <Text style={styles.statLabel}>Days Left</Text>
                </View>
              </View>
            </View>
          </ProfessionalCard>

          {/* Personal Counter Section */}
          <ProfessionalCard style={styles.personalCard}>
            <View style={styles.personalHeader}>
              <Text style={styles.sectionTitle}>Your Spiritual Journey</Text>
              <Text style={styles.countdownText}>Time to Milad un Nabi: {formattedCountdown}</Text>
            </View>

            <Animated.View 
              style={[
                styles.personalCounterContainer, 
                { 
                  opacity: animations.fadeAnim,
                  transform: [{ scale: animations.pulseAnim }]
                }
              ]}
            >
              <Text style={styles.personalCount}>{formatNumber(personalCount)}</Text>
              <Text style={styles.duroodLabel}>Durood Shareef</Text>
              <Text style={styles.rewardText}>May Allah accept your prayers</Text>
            </Animated.View>
          </ProfessionalCard>

          {/* Tally Button Section */}
          <View style={styles.tallySection}>
            <Animated.View style={{ transform: [{ scale: animations.scaleAnim }] }}>
              <TouchableOpacity
                style={styles.tallyButton}
                onPress={handleTallyPress}
                disabled={isIncrementing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#f4d03f', '#d4af37', '#b7950b', '#d4af37', '#f4d03f']}
                  style={styles.tallyButtonGradient}
                  locations={[0, 0.25, 0.5, 0.75, 1]}
                >
                  <View style={styles.tallyButtonContent}>
                    {isIncrementing ? (
                      <ActivityIndicator size="large" color="#0f3818" />
                    ) : (
                      <>
                        <IslamicPattern size={40} color="#0f3818" />
                        <Text style={styles.tallyButtonText}>+1</Text>
                        <Text style={styles.tallySubText}>Tap for Durood</Text>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Bulk Add Button */}
          <TouchableOpacity
            style={styles.bulkButton}
            onPress={handleBulkAdd}
            activeOpacity={0.8}
          >
            <Text style={styles.bulkButtonText}>Add Bulk Count</Text>
          </TouchableOpacity>

          {/* Durood Text Section */}
          <ProfessionalCard style={styles.duroodCard}>
            <View style={styles.duroodHeader}>
              <IslamicPattern size={30} color="#d4af37" />
              <Text style={styles.duroodTitle}>Durood Ibrahim</Text>
              <IslamicPattern size={30} color="#d4af37" />
            </View>
            
            <Text style={styles.arabicText}>
              اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ{'\n'}
              كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ{'\n'}
              إِنَّكَ حَمِيدٌ مَجِيدٌ
            </Text>
            
            <View style={styles.transliterationContainer}>
              <Text style={styles.transliteration}>
                &ldquo;Allahumma salli &apos;ala Muhammadin wa &apos;ala ali Muhammad,{'\n'}
                kama sallayta &apos;ala Ibrahima wa &apos;ala ali Ibrahim,{'\n'}
                innaka Hamidun Majid.&rdquo;
              </Text>
            </View>

            <Text style={styles.translation}>
              &ldquo;O Allah, send prayers upon Muhammad and the family of Muhammad,{'\n'}
              as You sent prayers upon Ibrahim and the family of Ibrahim,{'\n'}
              indeed You are Praiseworthy and Glorious.&rdquo;
            </Text>
          </ProfessionalCard>

          {/* Error Display */}
          {error && (
            <ProfessionalCard style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={resetError} style={styles.errorButton}>
                <Text style={styles.errorButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </ProfessionalCard>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              May Allah&apos;s peace and blessings be upon our beloved Prophet ﷺ
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: height * 0.1,
    right: -50,
    opacity: 0.05,
    zIndex: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#b8d4c2',
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  headerPattern: {
    marginBottom: 15,
  },
  bismillah: {
    fontSize: 18,
    color: '#d4af37',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#b8d4c2',
    fontWeight: '500',
    marginBottom: 15,
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  lineSegment: {
    width: 40,
    height: 1,
    backgroundColor: '#d4af37',
    marginHorizontal: 10,
  },
  mawlidText: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
    position: 'relative',
  },
  globalCard: {
    marginTop: 10,
  },
  globalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#d4af37',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  globalSubtitle: {
    fontSize: 14,
    color: '#b8d4c2',
    fontStyle: 'italic',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressRingContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  progressRing: {
    transform: [{ rotate: '-90deg' }],
  },
  progressCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    color: '#b8d4c2',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#b8d4c2',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 10,
  },
  personalCard: {},
  personalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownText: {
    fontSize: 14,
    color: '#f39c12',
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
  personalCounterContainer: {
    alignItems: 'center',
  },
  personalCount: {
    fontSize: 48,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  duroodLabel: {
    fontSize: 18,
    color: '#d4af37',
    fontWeight: '500',
    marginBottom: 5,
  },
  rewardText: {
    fontSize: 12,
    color: '#b8d4c2',
    fontStyle: 'italic',
  },
  tallySection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tallyButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    elevation: 12,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  tallyButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tallyButtonContent: {
    alignItems: 'center',
  },
  tallyButtonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0f3818',
    marginVertical: 5,
  },
  tallySubText: {
    fontSize: 12,
    color: '#0f3818',
    fontWeight: '600',
  },
  bulkButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    marginHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bulkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  duroodCard: {},
  duroodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  duroodTitle: {
    fontSize: 18,
    color: '#d4af37',
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  arabicText: {
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 32,
    fontWeight: '500',
  },
  transliterationContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  transliteration: {
    fontSize: 14,
    color: '#d4af37',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  translation: {
    fontSize: 13,
    color: '#b8d4c2',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  errorCard: {
    backgroundColor: 'rgba(198, 40, 40, 0.1)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: 'center',
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#b8d4c2',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 