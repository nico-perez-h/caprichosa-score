import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PredictionsProvider } from '../contexts/PredictionsContext';
import { UserProfileProvider } from '../contexts/UserProfileContext';

export default function RootLayout() {
  return (
    <UserProfileProvider>
      <PredictionsProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="tournament/[id]" />
          <Stack.Screen name="match/[id]" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="group" />
        </Stack>

        <StatusBar style="light" />
      </PredictionsProvider>
    </UserProfileProvider>
  );
}