import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { getCurrentGroup } from '@/services/groupsService';

export default function TabLayout() {
  const { session, isLoadingSession } = useAuth();
  const [hasGroup, setHasGroup] = useState<boolean | null>(null);
  const [isCheckingGroup, setIsCheckingGroup] = useState(true);

  useEffect(() => {
    async function checkGroup() {
      if (!session) {
        setHasGroup(null);
        setIsCheckingGroup(false);
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

    checkGroup();
  }, [session]);

  if (isLoadingSession || isCheckingGroup) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#111827" />
        <Text style={styles.loadingText}>Cargando app...</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (!hasGroup) {
    return <Redirect href="/group" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="matches"
        options={{
          title: 'Partidos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="soccer"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="predictions"
        options={{
          title: 'Predicciones',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ranking"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="medal-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tournaments"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
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