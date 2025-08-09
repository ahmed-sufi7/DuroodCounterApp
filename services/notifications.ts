import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { firebaseService } from './firebaseService';

export interface RegisteredPush {
  type: 'fcm' | 'expo' | 'none';
  token?: string;
}

export async function registerForPushNotifications(): Promise<RegisteredPush> {
  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFBB33',
    });
  }

  // Permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return { type: 'none' };
  }

  // Try to get a native push token (FCM/APNs) for dev/production builds
  try {
    if (Device.isDevice) {
      // projectId required for getDevicePushTokenAsync on EAS builds
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      if (projectId) {
        const deviceToken = await Notifications.getDevicePushTokenAsync({ projectId });
        const token = deviceToken.data;
        await firebaseService.savePushToken({ token, provider: 'fcm', platform: Platform.OS });
        return { type: 'fcm', token };
      }
    }
  } catch {
    // fall through to Expo token
  }

  // Fallback: Expo push token (works in Expo Go)
  try {
    const expToken = await Notifications.getExpoPushTokenAsync();
    const token = expToken.data;
    await firebaseService.savePushToken({ token, provider: 'expo', platform: Platform.OS });
    return { type: 'expo', token };
  } catch {
    return { type: 'none' };
  }
}


