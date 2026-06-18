import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PredictionsProvider } from '../contexts/PredictionsContext';

export default function RootLayout() {
  return (
    <PredictionsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tournament/[id]" />
        <Stack.Screen name="match/[id]" />
      </Stack>

      <StatusBar style="light" />
    </PredictionsProvider>
  );
}