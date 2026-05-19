import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { getStoredToken } from '../services/api';
import { getProfile } from '../services/auth.service';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { ToastContainer } from '../components/ui/Toast';
import { useNotifications } from '../hooks/useNotifications';
import { Colors } from '../theme/colors';

function NotificationBridge() {
  useNotifications();
  return null;
}

export function AppNavigator() {
  const { user, isHydrated, setHydrated, logout } = useAuthStore();

  useEffect(() => {
    const hydrate = async () => {
      const token = await getStoredToken();
      if (!token) { setHydrated(null, null); return; }
      try {
        const profile = await getProfile(token);
        setHydrated(
          {
            id: profile._id,
            name: profile.name,
            email: profile.email,
            career: profile.career ?? profile.specialization ?? profile.seniority,
            skills: profile.skills ?? [],
            profilePicture: profile.profilePicture,
          },
          token
        );
      } catch {
        await logout();
      }
    };
    hydrate();
  }, []);

  if (!isHydrated) {
    return (
      <View style={styles.splash}>
        <View style={styles.logoCircle}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        {user ? <MainNavigator /> : <AuthNavigator />}
        {user && <NotificationBridge />}
        <ToastContainer />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
});
