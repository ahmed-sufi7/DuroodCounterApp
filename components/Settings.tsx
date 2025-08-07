import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { IslamicPattern } from './IslamicPattern';
interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  showArrow?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  showArrow = true 
}) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingsItemContent}>
      <View style={styles.settingsItemIcon}>
        <Text style={styles.settingsItemEmoji}>{icon}</Text>
      </View>
      <View style={styles.settingsItemText}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {showArrow && (
      <View style={styles.settingsItemArrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    )}
  </TouchableOpacity>
);

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <View style={styles.settingsSection}>
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLine} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <View style={styles.sectionHeaderLine} />
    </View>
    <View style={styles.settingsCard}>
      {children}
    </View>
  </View>
);

export function Settings() {
  const [showContactModal, setShowContactModal] = useState(false);

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id123456789',
      android: 'https://play.google.com/store/apps/details?id=com.duroodcounter.app',
      default: 'https://play.google.com/store/apps/details?id=com.duroodcounter.app'
    });
    
    Linking.openURL(storeUrl).catch(() => {
      Alert.alert('Error', 'Unable to open store. Please rate us manually in your app store.');
    });
  };

  const handleContactDeveloper = () => {
    setShowContactModal(true);
  };

  const handleCallDeveloper = () => {
    setShowContactModal(false);
    setTimeout(() => {
      Linking.openURL('tel:+918310868540').catch(() => {
        Alert.alert('Error', 'Unable to open phone app. Please dial +91 8310868540 manually.');
      });
    }, 300);
  };

  const handleEmailDeveloper = () => {
    setShowContactModal(false);
    setTimeout(() => {
      const email = 'pixelwebstudio7@gmail.com';
      const subject = 'Durood Counter App - Feedback';
      const body = 'As-salamu alaykum Mohammed Ahmed Raza Sufi,\n\nI would like to share my feedback about the Durood Counter app:\n\n';
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      Linking.openURL(mailtoUrl).catch(() => {
        Alert.alert('Email', 'Please email us at: pixelwebstudio7@gmail.com');
      });
    }, 300);
  };

  const handleReportBug = () => {
    const email = 'pixelwebstudio7@gmail.com';
    const subject = 'Durood Counter App - Bug Report';
    const body = 'As-salamu alaykum,\n\nI found a bug in the Durood Counter app:\n\nBug Description:\n\nSteps to Reproduce:\n1. \n2. \n3. \n\nExpected Behavior:\n\nActual Behavior:\n\nDevice Information:\n- Device: \n- OS Version: \n- App Version: 1.0.0\n\n';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Report Bug',
        `Please email us at: ${email}`,
        [
          { text: 'Copy Email', onPress: () => {/* Copy to clipboard logic */} },
          { text: 'OK' }
        ]
      );
    });
  };

  const handleAboutDurood = () => {
    Alert.alert(
      '🤲 About Durood Sharif',
      'Durood Sharif is a form of prayer and blessing upon Prophet Muhammad ﷺ. It is one of the most beloved acts of worship in Islam.\n\n"Indeed, Allah and His angels send blessings upon the Prophet. O you who believe, ask Allah to bless him and grant him peace." - Quran 33:56\n\nReciting Durood brings immense spiritual benefits and draws us closer to Allah and His Messenger ﷺ.',
      [{ text: 'Alhamdulillah', style: 'default' }]
    );
  };

  const handleAboutMission = () => {
    Alert.alert(
      '🎯 Our Global Mission',
      'Our goal is to unite Muslims worldwide in reciting 15 Crore (150 Million) Durood Sharif in honor of Milad un Nabi ﷺ.\n\nThis collective effort represents our love and respect for Prophet Muhammad ﷺ and helps strengthen the global Muslim community through shared spiritual practice.\n\nJoin millions of Muslims in this blessed endeavor!',
      [{ text: 'SubhanAllah', style: 'default' }]
    );
  };

  const handleAboutUs = () => {
    Alert.alert(
      '🕌 About Durood Counter',
      'Durood Counter is a spiritual companion app designed to help Muslims worldwide participate in collective worship.\n\nOur mission is to make it easy for believers to track their spiritual progress while contributing to a global community effort.\n\n"The believers, in their love, mercy, and compassion for one another, are like a single body." - Prophet Muhammad ﷺ\n\nVersion 1.0.0\n\nMay Allah accept our efforts and grant us His blessings.',
      [{ text: 'Ameen', style: 'default' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      '🔒 Privacy Policy',
      'We take your privacy seriously and are committed to protecting your personal information.\n\n• We only collect the minimum data necessary for app functionality\n• Your Durood count data is stored securely\n• We do not share personal information with third parties\n• No tracking or advertising\n• Data is used solely for the spiritual community purpose\n\nFor full details, please visit our privacy policy on our website.',
      [{ text: 'Understood' }]
    );
  };

  const handleShareApp = () => {
    const shareText = 'Join me in reciting Durood for Prophet Muhammad ﷺ! Let\'s reach our goal of 15 Crore Durood together. Download Durood Counter app and be part of this blessed mission. 🤲📿';
    
    // You can implement proper sharing logic here using expo-sharing
    Alert.alert(
      '📤 Share App',
      shareText,
      [
        { text: 'Copy Message', onPress: () => {/* Copy to clipboard logic */} },
        { text: 'Share', onPress: () => {/* Open share dialog */} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <IslamicPattern />
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={Colors.primary.darkTeal}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>App Preferences</Text>
            </View>
            <View style={styles.headerRight} />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* App Section */}
          <SettingsSection title="App">
            <SettingsItem
              icon="⭐"
              title="Rate This App"
              subtitle="Share your experience with others"
              onPress={handleRateApp}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="📤"
              title="Share App"
              subtitle="Invite friends to join our mission"
              onPress={handleShareApp}
            />
          </SettingsSection>

          {/* Support Section */}
          <SettingsSection title="Support">
            <SettingsItem
              icon="👨‍💻"
              title="Contact Developer"
              subtitle="Get in touch with our team"
              onPress={handleContactDeveloper}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="🐛"
              title="Report a Bug"
              subtitle="Help us improve the app"
              onPress={handleReportBug}
            />
          </SettingsSection>

          {/* Information Section */}
          <SettingsSection title="Information">
            <SettingsItem
              icon="🤲"
              title="About Durood"
              subtitle="Learn about the blessings of Durood"
              onPress={handleAboutDurood}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="🎯"
              title="Our Global Mission"
              subtitle="15 Crore Durood for Milad un Nabi ﷺ"
              onPress={handleAboutMission}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="🕌"
              title="About Us"
              subtitle="Learn about our app and mission"
              onPress={handleAboutUs}
            />
          </SettingsSection>

          {/* Legal Section */}
          <SettingsSection title="Legal">
            <SettingsItem
              icon="🔒"
              title="Privacy Policy"
              subtitle="How we protect your data"
              onPress={handlePrivacyPolicy}
            />
          </SettingsSection>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Durood Counter v1.0.0</Text>
            <Text style={styles.appInfoSubtext}>Made with ❤️ for the Ummah</Text>
            <Text style={styles.appInfoDua}>
              رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
            </Text>
            <Text style={styles.appInfoDuaTranslation}>
              &ldquo;O Allah, accept this from us. Indeed, You are the All-Hearing, All-Knowing.&rdquo;
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Contact Developer Modal */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.contactModalContainer}>
            <View style={styles.contactModalHeader}>
              <View style={styles.contactModalIcon}>
                <Text style={styles.contactModalIconText}>👨‍💻</Text>
              </View>
              <Text style={styles.contactModalTitle}>Contact Developer</Text>
              
            </View>

            <View style={styles.contactModalContent}>
              <View style={styles.contactInfoItem}>
                <View style={styles.contactInfoIcon}>
                  <Text style={styles.contactInfoEmoji}>💻</Text>
                </View>
                <View style={styles.contactInfoText}>
                  <Text style={styles.contactInfoLabel}>Developer</Text>
                  <Text style={styles.contactInfoValue}>Mohammed Ahmed Raza Sufi</Text>
                </View>
              </View>

              <View style={styles.contactInfoItem}>
                <View style={styles.contactInfoIcon}>
                  <Text style={styles.contactInfoEmoji}>📱</Text>
                </View>
                <View style={styles.contactInfoText}>
                  <Text style={styles.contactInfoLabel}>Phone</Text>
                  <Text style={styles.contactInfoValue}>+91 8310868540</Text>
                </View>
              </View>

              <View style={styles.contactInfoItem}>
                <View style={styles.contactInfoIcon}>
                  <Text style={styles.contactInfoEmoji}>📧</Text>
                </View>
                <View style={styles.contactInfoText}>
                  <Text style={styles.contactInfoLabel}>Email</Text>
                  <Text style={styles.contactInfoValue}>pixelwebstudio7@gmail.com</Text>
                </View>
              </View>
            </View>

            <View style={styles.contactModalActions}>
              <TouchableOpacity
                style={styles.contactActionButton}
                onPress={handleCallDeveloper}
                activeOpacity={0.8}
              >
                <View style={styles.contactActionIcon}>
                  <Text style={styles.contactActionEmoji}>📞</Text>
                </View>
                <Text style={styles.contactActionText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactActionButton}
                onPress={handleEmailDeveloper}
                activeOpacity={0.8}
              >
                <View style={styles.contactActionIcon}>
                  <Text style={styles.contactActionEmoji}>📧</Text>
                </View>
                <Text style={styles.contactActionText}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactActionButton, styles.contactCloseButton]}
                onPress={() => setShowContactModal(false)}
                activeOpacity={0.8}
              >
                <View style={styles.contactActionIcon}>
                  <Text style={styles.contactActionEmoji}>✕</Text>
                </View>
                <Text style={styles.contactActionText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary.darkTeal,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.mediumTeal,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.neutral.white,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: -2, // Fine-tune vertical alignment
    marginLeft: -1, // Fine-tune horizontal alignment for left-pointing arrow
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.neutral.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.neutral.white,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 44,
    height: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  // Section Headers (reusing from DuroodCounter)
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
  // Settings Sections
  settingsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  settingsCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
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
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.neutral.white,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsItemEmoji: {
    fontSize: 20,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.darkTeal,
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    color: Colors.neutral.darkGray,
    lineHeight: 18,
  },
  settingsItemArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: Colors.neutral.mediumGray,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginHorizontal: 20,
  },
  // App Info
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
  },
  appInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.white,
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: Colors.neutral.white,
    opacity: 0.7,
    marginBottom: 16,
  },
  appInfoDua: {
    fontSize: 16,
    color: Colors.secondary.warmGold,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  appInfoDuaTranslation: {
    fontSize: 12,
    color: Colors.neutral.white,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  // Contact Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contactModalContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 30,
      elevation: 20,
    }),
  },
  contactModalHeader: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  contactModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.darkTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactModalIconText: {
    fontSize: 28,
  },
  contactModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.darkTeal,
    marginBottom: 4,
    textAlign: 'center',
  },
  contactModalSubtitle: {
    fontSize: 16,
    color: Colors.secondary.warmGold,
    fontWeight: '600',
    textAlign: 'center',
  },
  contactModalContent: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  contactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  contactInfoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfoEmoji: {
    fontSize: 20,
  },
  contactInfoText: {
    flex: 1,
  },
  contactInfoLabel: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginBottom: 2,
    fontWeight: '500',
  },
  contactInfoValue: {
    fontSize: 16,
    color: Colors.primary.darkTeal,
    fontWeight: '600',
  },
  contactModalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
  },
  contactActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.primary.darkTeal,
    borderRadius: 12,
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
  contactCloseButton: {
    backgroundColor: Colors.neutral.mediumGray,
  },
  contactActionIcon: {
    marginBottom: 8,
  },
  contactActionEmoji: {
    fontSize: 20,
  },
  contactActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
});
