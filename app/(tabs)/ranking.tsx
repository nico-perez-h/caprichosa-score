import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentGroupData } from "@/services/groupsService";
import { getMatches } from "@/services/matchesService";
import { getPredictionsByUserIds } from "@/services/predictionsService";
import type { Match } from "@/types/match";
import { calculatePredictionStats } from "../../utils/predictionStats";

type RankingPlayer = {
  id: string;
  name: string;
  points: number;
  predictions: number;
  accuracy: number;
  position: number;
  role: "admin" | "member";
  isCurrentUser: boolean;
};

function getPositionLabel(position: number) {
  return `#${position}`;
}

export default function RankingScreen() {
  const { user } = useAuth();

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [rankingPlayers, setRankingPlayers] = useState<RankingPlayer[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isLoadingRanking, setIsLoadingRanking] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      setIsLoadingMatches(true);

      const loadedMatches = await getMatches();

      setAllMatches(loadedMatches);
      setIsLoadingMatches(false);
    }

    loadMatches();
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function loadRanking() {
        if (allMatches.length === 0) {
          return;
        }

        try {
          setIsLoadingRanking(true);

          const groupData = await getCurrentGroupData();

          if (!groupData) {
            setRankingPlayers([]);
            setGroupName("");
            return;
          }

          setGroupName(groupData.group.name);

          const memberUserIds = groupData.members.map(
            (member) => member.userId,
          );

          const allPredictions = await getPredictionsByUserIds({
            userIds: memberUserIds,
            groupId: groupData.group.id,
          });

          const players = groupData.members
            .map((member) => {
              const memberPredictions = allPredictions.filter(
                (prediction) => prediction.user_id === member.userId,
              );

              const predictionsRecord = memberPredictions.reduce(
                (record, prediction) => {
                  record[prediction.match_id] = {
                    matchId: prediction.match_id,
                    homeScore: prediction.home_score,
                    awayScore: prediction.away_score,
                  };

                  return record;
                },
                {} as Record<
                  string,
                  { matchId: string; homeScore: number; awayScore: number }
                >,
              );

              const stats = calculatePredictionStats(
                allMatches,
                predictionsRecord,
              );

              return {
                id: member.userId,
                name: member.playerName,
                points: stats.totalPoints,
                predictions: stats.totalPredictions,
                accuracy: stats.accuracy,
                role: member.role,
                isCurrentUser: member.userId === user?.id,
              };
            })
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

          setRankingPlayers(players);
        } catch {
          setRankingPlayers([]);
        } finally {
          setIsLoadingRanking(false);
        }
      }

      loadRanking();
    }, [allMatches, user?.id]),
  );

  const currentUserRank = rankingPlayers.find((player) => player.isCurrentUser);

  const isLoading = isLoadingMatches || isLoadingRanking;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Ranking"
        subtitle={
          groupName
            ? `Tabla del grupo ${groupName}.`
            : "Mira tu posición y compite con tus amigos."
        }
      />

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color="#111827" />
          <Text style={styles.loadingTitle}>Cargando ranking...</Text>
          <Text style={styles.loadingText}>
            Estamos calculando los puntos del grupo activo.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.userCard}>
            <View style={styles.positionBox}>
              <Text style={styles.positionText}>
                {getPositionLabel(currentUserRank?.position ?? 1)}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {currentUserRank?.name ?? "Jugador"}
              </Text>
              <Text style={styles.userDescription}>
                {groupName
                  ? `Jugando en ${groupName}`
                  : "Tu posición se calcula con tus predicciones reales."}
              </Text>
            </View>

            <View style={styles.pointsBox}>
              <Text style={styles.pointsText}>
                {currentUserRank?.points ?? 0}
              </Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
          </View>

          <View style={styles.rankingCard}>
            <Text style={styles.rankingTitle}>Tabla de posiciones</Text>

            {rankingPlayers.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Sin integrantes</Text>
                <Text style={styles.emptyText}>
                  Cuando haya miembros en el grupo, aparecerán aquí.
                </Text>
              </View>
            ) : (
              rankingPlayers.map((player) => (
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
                      {player.role === "admin" ? "Administrador" : "Miembro"} ·{" "}
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
              ))
            )}
          </View>

          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Ranking del grupo activo</Text>
            <Text style={styles.previewText}>
              Esta tabla ya usa los integrantes reales del grupo activo y sus
              predicciones guardadas en Supabase.
            </Text>
          </View>
        </>
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
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  loadingTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
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
  emptyBox: {
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
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
