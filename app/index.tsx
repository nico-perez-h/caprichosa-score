import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { getCurrentGroup } from '../services/groupsService';

export default function IndexScreen() {
  const { session, isLoadingSession } = useAuth();
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [isCheckingGroup, setIsCheckingGroup] = useState(false);

  useEffect(() => {
    async function checkUserGroup() {
      if (!session) {
        setHasGroup(null);
        return;
      }

      try {
        setIsCheckingGroup(true);

        const currentGroup = await getCurrentGroup();

        setHasGroup(Boolean(currentGroup));
      } catch {
        setHasGroup(false);
      } finally {
        setIsCheckingGroup(false);
      }
    }

    checkUserGroup();
  }, [session]);

  if (isLoadingSession || isCheckingGroup) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator color="#111827" />
        <Text style={styles.loadingText}>Cargando sesión...</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (!hasGroup) {
    return <Redirect href="/group" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
});