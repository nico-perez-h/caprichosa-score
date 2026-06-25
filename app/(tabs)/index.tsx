import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScoringRulesCard } from "@/components/ScoringRulesCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { matches } from "@/data/matches";
import { tournaments } from "@/data/tournaments";
import { usePredictions } from "../../contexts/PredictionsContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { calculateTotalPredictionPoints } from "../../utils/scoring";

export default function HomeScreen() {
  const { predictions } = usePredictions();
  const { playerName } = useUserProfile();

  const totalPoints = calculateTotalPredictionPoints(matches, predictions);
  const totalPredictions = Object.keys(predictions).length;
  const totalMatches = matches.length;
  const activeTournaments = tournaments.filter(
    (tournament) => tournament.status === "Disponible",
  ).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoBox}>
        <MaterialCommunityIcons name="soccer" size={45} color="#FFFFFF" />
      </View>

      <ScreenHeader
        title="Caprichosa Score"
        subtitle="Predice resultados, suma puntos y compite con tus amigos."
      />

      <View style={styles.profileShortcutCard}>
        <View style={styles.profileTextBox}>
          <Text style={styles.profileTitle}>Hola, {playerName}</Text>
          <Text style={styles.profileDescription}>
            Revisa tus estadísticas, puntos y configuración de cuenta.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/profile" as never)}
        >
          <Text style={styles.profileButtonText}>Ver perfil</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/api-status" as never)}
        >
          <Text style={styles.secondaryButtonText}>Estado de API</Text>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Puntos</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalPredictions}</Text>
          <Text style={styles.statLabel}>Predicciones</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalMatches}</Text>
          <Text style={styles.statLabel}>Partidos</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{activeTournaments}</Text>
          <Text style={styles.statLabel}>Torneos activos</Text>
        </View>
      </View>

      <View style={styles.nextCard}>
        <Text style={styles.nextTitle}>Sigue prediciendo</Text>
        <Text style={styles.nextText}>
          Entra a los partidos disponibles y guarda tus marcadores antes de que
          empiecen.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/matches" as never)}
        >
          <Text style={styles.primaryButtonText}>Ver partidos</Text>
        </Pressable>
      </View>

      <ScoringRulesCard />

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/tournaments" as never)}
        >
          <Text style={styles.secondaryButtonText}>Torneos</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/predictions" as never)}
        >
          <Text style={styles.secondaryButtonText}>Predicciones</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  profileShortcutCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  profileTextBox: {
    marginBottom: 14,
  },
  profileTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  profileDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  profileButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "47.8%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#6B7280",
  },
  nextCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  nextTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  nextText: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
