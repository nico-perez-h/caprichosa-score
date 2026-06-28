import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MatchCard } from "@/components/MatchCard";
import { getCurrentGroup } from "@/services/groupsService";
import { getMatches, getTodayMatches } from "@/services/matchesService";
import type { Group } from "@/types/group";
import type { Match } from "@/types/match";
import { usePredictions } from "../../contexts/PredictionsContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { calculateTotalPredictionPoints } from "../../utils/scoring";

function isPlaceholderTeam(teamName: string) {
  const cleanTeamName = teamName.trim().toLowerCase();

  return (
    cleanTeamName.includes("tbd") ||
    cleanTeamName.includes("por definir") ||
    cleanTeamName.includes("winner") ||
    cleanTeamName.includes("ganador") ||
    cleanTeamName.includes("1st group") ||
    cleanTeamName.includes("2nd group") ||
    cleanTeamName.includes("3rd group") ||
    cleanTeamName.includes("local") ||
    cleanTeamName.includes("visitante")
  );
}

function isConfirmedMatch(match: Match) {
  return (
    !isPlaceholderTeam(match.homeTeam) &&
    !isPlaceholderTeam(match.awayTeam) &&
    match.homeTeam.trim().length > 0 &&
    match.awayTeam.trim().length > 0
  );
}

function getMatchesWithoutPrediction(
  matches: Match[],
  predictions: Record<string, unknown>
) {
  return matches.filter(
    (match) =>
      match.status === "Por jugar" &&
      isConfirmedMatch(match) &&
      !predictions[match.id]
  );
}

export default function HomeScreen() {
  const { predictions, getPrediction } = usePredictions();
  const { playerName } = useUserProfile();

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      setIsLoadingMatches(true);

      const [loadedMatches, loadedTodayMatches] = await Promise.all([
        getMatches(),
        getTodayMatches(),
      ]);

      setAllMatches(loadedMatches);
      setTodayMatches(loadedTodayMatches.filter(isConfirmedMatch));
      setIsLoadingMatches(false);
    }

    loadMatches();
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function loadActiveGroup() {
        try {
          setIsLoadingGroup(true);

          const currentGroup = await getCurrentGroup();

          setActiveGroup(currentGroup);
        } catch {
          setActiveGroup(null);
        } finally {
          setIsLoadingGroup(false);
        }
      }

      loadActiveGroup();
    }, [])
  );

  const totalPoints = calculateTotalPredictionPoints(allMatches, predictions);
  const totalPredictions = Object.keys(predictions).length;
  const pendingPredictions = getMatchesWithoutPrediction(allMatches, predictions);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoBox}>
        <MaterialCommunityIcons name="soccer" size={40} color="#FFFFFF" />
      </View>

      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {playerName}</Text>
        <Text style={styles.title}>Bienvenido a Caprichosa Score</Text>
        <Text style={styles.subtitle}>
          Revisa los partidos de hoy y sigue sumando puntos con tus
          predicciones.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.activeGroupCard,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.push("/my-groups" as never)}
      >
        <View style={styles.activeGroupIconBox}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={24}
            color="#111827"
          />
        </View>

        <View style={styles.activeGroupInfo}>
          <Text style={styles.activeGroupLabel}>Jugando en</Text>
          <Text style={styles.activeGroupName}>
            {isLoadingGroup
              ? "Cargando grupo..."
              : activeGroup?.name ?? "Sin grupo activo"}
          </Text>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#9CA3AF"
        />
      </Pressable>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Puntos</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalPredictions}</Text>
          <Text style={styles.statLabel}>Predicciones</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {isLoadingMatches ? "..." : pendingPredictions.length}
          </Text>
          <Text style={styles.statLabel}>Por hacer</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Partidos de hoy</Text>
        <Text style={styles.sectionDescription}>
          Los encuentros programados para este día.
        </Text>
      </View>

      {isLoadingMatches ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color="#111827" />
          <Text style={styles.emptyTitle}>Cargando partidos...</Text>
          <Text style={styles.emptyText}>
            Estamos revisando los partidos disponibles.
          </Text>
        </View>
      ) : todayMatches.length > 0 ? (
        <View style={styles.matchesList}>
          {todayMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              savedPrediction={getPrediction(match.id)}
              onPress={() => router.push(`/match/${match.id}` as never)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No hay partidos hoy</Text>
          <Text style={styles.emptyText}>
            Cuando haya partidos programados para este día, aparecerán aquí.
            Puedes revisar los próximos encuentros en la pestaña Partidos.
          </Text>
        </View>
      )}
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
    marginBottom: 22,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 17,
    fontWeight: "900",
    color: "#6B7280",
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeGroupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  activeGroupIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  activeGroupInfo: {
    flex: 1,
  },
  activeGroupLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6B7280",
    marginBottom: 3,
  },
  activeGroupName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 25,
    fontWeight: "900",
    color: "#111827",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    color: "#6B7280",
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  sectionDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  matchesList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
});