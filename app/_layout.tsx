import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "../contexts/AuthContext";
import { PredictionsProvider } from "../contexts/PredictionsContext";
import { UserProfileProvider } from "../contexts/UserProfileContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <PredictionsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="tournament/[id]" />
            <Stack.Screen name="match/[id]" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="group" />
            <Stack.Screen name="join-group" />
            <Stack.Screen name="create-group" />
            <Stack.Screen name="api-status" />
            <Stack.Screen name="results" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/register" />
          </Stack>

          <StatusBar style="light" />
        </PredictionsProvider>
      </UserProfileProvider>
    </AuthProvider>
  );
}
