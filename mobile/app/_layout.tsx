import { useEffect, useCallback } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore, useNetworkStore, useAppStore } from '@/lib/store';
import { ErrorBoundary } from '@/lib/ErrorBoundary';
import colors from '@/lib/colors';

SplashScreen.preventAutoHideAsync();

function NetworkBanner() {
  const { isConnected, isInternetReachable } = useNetworkStore();

  if (isConnected && isInternetReachable !== false) {
    return null;
  }

  return (
    <View style={styles.networkBanner}>
      <Text style={styles.networkBannerText}>
        {!isConnected
          ? 'No network connection'
          : 'No internet access - Some features may not work'}
      </Text>
    </View>
  );
}

function RootLayoutContent() {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();
  const { setNetworkState } = useNetworkStore();
  const { setAppReady } = useAppStore();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });

  // Initialize authentication state
  useEffect(() => {
    checkAuth();
  }, []);

  // Set up network state monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    return () => unsubscribe();
  }, [setNetworkState]);

  // Handle app ready state and splash screen
  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded, setAppReady]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [isLoading, fontsLoaded, isAuthenticated]);

  if (isLoading || !fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <NetworkBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(screens)" options={{ headerShown: true }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for debugging
    console.error('[App] Uncaught error:', error.message);

    // In production, you might want to:
    // 1. Send to error tracking service (Sentry, etc.)
    // 2. Show a user-friendly error message
    // 3. Try to recover gracefully
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      <RootLayoutContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  networkBanner: {
    backgroundColor: colors.red[500],
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  networkBannerText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
});
