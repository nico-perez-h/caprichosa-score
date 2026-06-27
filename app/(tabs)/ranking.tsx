import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenHeader } from "@/components/ScreenHeader";
import {
  mockRankingPlayers,
  type RankingPlayer,
} from "@/data/mockRankingPlayers";
import { getMatches } from "@/services/matchesService";
import type { Match } from "@/types/match";
import { usePredictions } from "../../contexts/PredictionsContext";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { calculatePredictionStats } from "../../utils/predictionStats";

type RankedPlayer = RankingPlayer & {
  position: number;
};

function getPositionLabel(position: number) {
  return `#${position}`;
}

export default function RankingScreen() {
  const { predictions } = usePredictions();
  const { playerName } = useUserProfile();

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      setIsLoadingMatches(true);

      const loadedMatches = await getMatches();

      setAllMatches(loadedMatches);
      setIsLoadingMatches(false);
    }

    loadMatches();
  }, []);

  const stats = calculatePredictionStats(allMatches, predictions);

  const currentUserPlayer: RankingPlayer = {
    id: "current-user",
    name: playerName,
    points: stats.totalPoints,
    predictions: stats.totalPredictions,
    accuracy: stats.accuracy,
    isCurrentUser: true,
  };

  const rankingPlayers: RankedPlayer[] = [
    currentUserPlayer,
    ...mockRankingPlayers,
  ]
    .sort((firstPlayer, secondPlayer) => {
      if (secondPlayer.points !== firstPlayer.points) {
        return secondPlayer.points - firstPlayer.points;
      }

      if (secondPlayer.accuracy !== firstPlayer.accuracy) {
        return secondPlayer.accuracy - firstPlayer.accuracy;
      }

      return secondPlayer.predictions - firstPlayer.predictions;
    })
    .map((player, index) => ({
      ...player,
      position: index + 1,
    }));

  const currentUserRank = rankingPlayers.find(
    (player) => player.id === "current-user",
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Ranking"
        subtitle="Mira tu posición y compite con tus amigos."
      />

      <View style={styles.userCard}>
        <View style={styles.positionBox}>
          <Text style={styles.positionText}>
            {getPositionLabel(currentUserRank?.position ?? 1)}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{playerName}</Text>
          <Text style={styles.userDescription}>
            Tu posición se calcula con tus predicciones reales.
          </Text>
        </View>

        <View style={styles.pointsBox}>
          <Text style={styles.pointsText}>
            {isLoadingMatches ? "..." : stats.totalPoints}
          </Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>

      <View style={styles.rankingCard}>
        <Text style={styles.rankingTitle}>Tabla de posiciones</Text>

        {rankingPlayers.map((player) => (
          <View
            key={player.id}
            style={[
              styles.rankingRow,
              player.isCurrentUser && styles.currentUserRankingRow,
            ]}
          >
            <Text
              style={[
                styles.rankingPosition,
                player.isCurrentUser && styles.currentUserText,
              ]}
            >
              {getPositionLabel(player.position)}
            </Text>

            <View style={styles.rankingPlayerInfo}>
              <Text
                style={[
                  styles.rankingName,
                  player.isCurrentUser && styles.currentUserText,
                ]}
              >
                {player.name}
              </Text>

              <Text
                style={[
                  styles.rankingMeta,
                  player.isCurrentUser && styles.currentUserMetaText,
                ]}
              >
                {player.predictions} predicciones · {player.accuracy}%
                efectividad
              </Text>
            </View>

            <Text
              style={[
                styles.rankingPoints,
                player.isCurrentUser && styles.currentUserText,
              ]}
            >
              {player.points} pts
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Ranking de prueba</Text>
        <Text style={styles.previewText}>
          Por ahora la tabla usa jugadores simulados. Tus puntos ya se calculan
          con tus predicciones reales; después conectaremos grupos y usuarios
          reales con Supabase.
        </Text>
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
  userCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  positionBox: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  userDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  pointsBox: {
    alignItems: "center",
  },
  pointsText: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#D1D5DB",
  },
  rankingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  rankingTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  currentUserRankingRow: {
    backgroundColor: "#F9FAFB",
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  rankingPosition: {
    width: 38,
    fontSize: 15,
    fontWeight: "900",
    color: "#9CA3AF",
  },
  rankingPlayerInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  rankingMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  rankingPoints: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  currentUserText: {
    color: "#111827",
  },
  currentUserMetaText: {
    color: "#374151",
  },
  previewCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1D4ED8",
    marginBottom: 6,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#1E40AF",
  },
});