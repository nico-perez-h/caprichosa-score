import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PenaltyPredictionCard } from "@/components/PenaltyPredictionCard";
import { PredictionCard } from "@/components/PredictionCard";
import { PredictionPointsSummary } from "@/components/PredictionPointsSummary";
import { PredictionStatusNotice } from "@/components/PredictionStatusNotice";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { usePredictions } from "../../contexts/PredictionsContext";
import { getCurrentGroup } from "../../services/groupsService";
import { getMatchById } from "../../services/matchesService";
import {
  deleteUserPenaltyPrediction,
  getUserPenaltyPredictionByMatchId,
  upsertUserPenaltyPrediction,
  type UserPenaltyPrediction,
} from "../../services/penaltyPredictionsService";
import type { Group } from "../../types/group";
import type { Match } from "../../types/match";

function getLocationText(match: Match) {
  const locationParts = [match.stadium, match.city].filter(
    (item) =>
      item &&
      item !== "Estadio no disponible" &&
      item !== "Ciudad no disponible" &&
      item !== "No disponible",
  );

  return locationParts.join(" · ");
}

function hasRealLocation(match: Match) {
  return getLocationText(match).length > 0;
}

function getMatchStartDate(match: Match) {
  const [day, month, year] = match.date.split("/");
  const [hour, minute] = match.kickoffTime.split(":");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0,
  );
}

function isMatchLockedByGroupConfig({
  match,
  activeGroup,
}: {
  match: Match;
  activeGroup: Group | null;
}) {
  if (match.status !== "Por jugar") {
    return true;
  }

  if (activeGroup?.predictionLockMinutes === null) {
    return false;
  }

  if (activeGroup?.predictionLockMinutes === undefined) {
    return false;
  }

  const matchStartDate = getMatchStartDate(match);
  const lockDate = new Date(
    matchStartDate.getTime() - activeGroup.predictionLockMinutes * 60 * 1000,
  );

  return new Date().getTime() >= lockDate.getTime();
}

function getPredictionLockText({
  match,
  activeGroup,
}: {
  match: Match;
  activeGroup: Group | null;
}) {
  if (match.status !== "Por jugar") {
    return "Este partido ya no está disponible para modificar predicciones.";
  }

  if (activeGroup?.predictionLockMinutes === null) {
    return "Este grupo usa el cierre por defecto: las predicciones se bloquean cuando el partido deja de estar Por jugar.";
  }

  if (activeGroup?.predictionLockMinutes === undefined) {
    return "Este grupo usa el cierre por defecto: las predicciones se bloquean cuando el partido deja de estar Por jugar.";
  }

  if (activeGroup.predictionLockMinutes === 10) {
    return "Las predicciones de este grupo se cierran 10 minutos antes del inicio del partido.";
  }

  if (activeGroup.predictionLockMinutes === 30) {
    return "Las predicciones de este grupo se cierran 30 minutos antes del inicio del partido.";
  }

  if (activeGroup.predictionLockMinutes === 60) {
    return "Las predicciones de este grupo se cierran 1 hora antes del inicio del partido.";
  }

  return `Las predicciones de este grupo se cierran ${activeGroup.predictionLockMinutes} minutos antes del inicio del partido.`;
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isKnockoutMatch(match: Match) {
  const textToCheck = normalizeText(
    `${match.group} ${match.tournament} ${match.homeTeam} ${match.awayTeam}`,
  );

  const knockoutKeywords = [
    "round of 32",
    "round 32",
    "r32",
    "dieciseisavos",
    "16avos",
    "round of 16",
    "round 16",
    "r16",
    "octavos",
    "quarter",
    "quarter-final",
    "quarter final",
    "cuartos",
    "semifinal",
    "semi-final",
    "semi final",
    "third place",
    "tercer lugar",
    "3rd place",
    "final",
  ];

  return knockoutKeywords.some((keyword) =>
    textToCheck.includes(normalizeText(keyword)),
  );
}

function TeamNameWithFlag({
  teamName,
  flagUrl,
}: {
  teamName: string;
  flagUrl?: string;
}) {
  return (
    <View style={styles.teamBox}>
      {flagUrl ? (
        <Image source={{ uri: flagUrl }} style={styles.flag} />
      ) : (
        <View style={styles.flagPlaceholder} />
      )}

      <Text style={styles.teamName} numberOfLines={2}>
        {teamName}
      </Text>
    </View>
  );
}

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    getPrediction,
    savePrediction: savePredictionInStore,
    deletePrediction: deletePredictionInStore,
  } = usePredictions();

  const [match, setMatch] = useState<Match | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [penaltyPrediction, setPenaltyPrediction] =
    useState<UserPenaltyPrediction | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homePenaltyScore, setHomePenaltyScore] = useState(0);
  const [awayPenaltyScore, setAwayPenaltyScore] = useState(0);

  useEffect(() => {
    async function loadMatch() {
      if (!id) {
        setIsLoadingMatch(false);
        return;
      }

      setIsLoadingMatch(true);

      try {
        const [loadedMatch, loadedGroup] = await Promise.all([
          getMatchById(id),
          getCurrentGroup(),
        ]);

        setMatch(loadedMatch);
        setActiveGroup(loadedGroup);

        if (loadedMatch) {
          const savedPrediction = getPrediction(loadedMatch.id);

          if (savedPrediction) {
            setHomeScore(savedPrediction.homeScore);
            setAwayScore(savedPrediction.awayScore);
          } else {
            setHomeScore(0);
            setAwayScore(0);
          }

          if (user && loadedGroup) {
            const savedPenaltyPrediction =
              await getUserPenaltyPredictionByMatchId({
                userId: user.id,
                groupId: loadedGroup.id,
                matchId: loadedMatch.id,
              });

            setPenaltyPrediction(savedPenaltyPrediction);

            if (savedPenaltyPrediction) {
              setHomePenaltyScore(
                savedPenaltyPrediction.home_penalty_score,
              );
              setAwayPenaltyScore(
                savedPenaltyPrediction.away_penalty_score,
              );
            } else {
              setHomePenaltyScore(0);
              setAwayPenaltyScore(0);
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo cargar el partido.";

        Alert.alert("Error", errorMessage);
      } finally {
        setIsLoadingMatch(false);
      }
    }

    loadMatch();
  }, [id, getPrediction, user]);

  if (isLoadingMatch) {
    return (
      <SafeAreaView style={styles.notFoundScreen}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <Text style={styles.notFoundTitle}>Cargando partido...</Text>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.notFoundScreen}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <Text style={styles.notFoundTitle}>Partido no encontrado</Text>
      </SafeAreaView>
    );
  }

  const currentMatch = match;
  const savedPrediction = getPrediction(currentMatch.id);
  const isPredictionLocked = isMatchLockedByGroupConfig({
    match: currentMatch,
    activeGroup,
  });
  const predictionLockText = getPredictionLockText({
    match: currentMatch,
    activeGroup,
  });
  const locationText = getLocationText(currentMatch);
  const isKnockout = isKnockoutMatch(currentMatch);
  const isCurrentPredictionDraw = homeScore === awayScore;
  const shouldShowPenaltyPrediction =
    isKnockout && isCurrentPredictionDraw && !!activeGroup && !!user;

  function decreaseHomeScore() {
    setHomeScore((currentScore) => Math.max(0, currentScore - 1));
  }

  function increaseHomeScore() {
    setHomeScore((currentScore) => currentScore + 1);
  }

  function decreaseAwayScore() {
    setAwayScore((currentScore) => Math.max(0, currentScore - 1));
  }

  function increaseAwayScore() {
    setAwayScore((currentScore) => currentScore + 1);
  }

  function decreaseHomePenaltyScore() {
    setHomePenaltyScore((currentScore) => Math.max(0, currentScore - 1));
  }

  function increaseHomePenaltyScore() {
    setHomePenaltyScore((currentScore) => currentScore + 1);
  }

  function decreaseAwayPenaltyScore() {
    setAwayPenaltyScore((currentScore) => Math.max(0, currentScore - 1));
  }

  function increaseAwayPenaltyScore() {
    setAwayPenaltyScore((currentScore) => currentScore + 1);
  }

  async function deletePenaltyPredictionSilently() {
    if (!user || !activeGroup || !penaltyPrediction) {
      return;
    }

    await deleteUserPenaltyPrediction({
      userId: user.id,
      groupId: activeGroup.id,
      matchId: currentMatch.id,
    });

    setPenaltyPrediction(null);
    setHomePenaltyScore(0);
    setAwayPenaltyScore(0);
  }

  async function savePrediction() {
    if (isPredictionLocked) {
      Alert.alert(
        "Predicciones cerradas",
        "Ya no puedes guardar predicciones para este partido.",
      );
      return;
    }

    try {
      await savePredictionInStore({
        matchId: currentMatch.id,
        homeScore,
        awayScore,
      });

      if (homeScore !== awayScore) {
        await deletePenaltyPredictionSilently();
      }

      Alert.alert(
        "Predicción guardada",
        `${currentMatch.homeTeam} ${homeScore} - ${awayScore} ${currentMatch.awayTeam}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la predicción.";

      Alert.alert("Error", errorMessage);
    }
  }

  async function deletePrediction() {
    if (isPredictionLocked) {
      Alert.alert(
        "Predicciones cerradas",
        "Ya no puedes eliminar predicciones para este partido.",
      );
      return;
    }

    try {
      await deletePredictionInStore(currentMatch.id);
      await deletePenaltyPredictionSilently();

      setHomeScore(0);
      setAwayScore(0);

      Alert.alert("Predicción eliminada", "Tu predicción fue eliminada.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la predicción.";

      Alert.alert("Error", errorMessage);
    }
  }

  async function savePenaltyPrediction() {
    if (isPredictionLocked) {
      Alert.alert(
        "Predicciones cerradas",
        "Ya no puedes guardar predicciones por penales para este partido.",
      );
      return;
    }

    if (!user || !activeGroup) {
      Alert.alert(
        "Grupo no disponible",
        "Necesitas estar dentro de un grupo para guardar penales.",
      );
      return;
    }

    if (!isKnockout) {
      Alert.alert(
        "Penales no disponibles",
        "La predicción por penales solo está disponible en eliminatorias.",
      );
      return;
    }

    if (homeScore !== awayScore) {
      Alert.alert(
        "Primero predice empate",
        "Solo puedes predecir penales si tu marcador del partido es empate.",
      );
      return;
    }

    try {
      const savedPenaltyPrediction = await upsertUserPenaltyPrediction({
        userId: user.id,
        groupId: activeGroup.id,
        matchId: currentMatch.id,
        homePenaltyScore,
        awayPenaltyScore,
      });

      setPenaltyPrediction(savedPenaltyPrediction);

      Alert.alert(
        "Penales guardados",
        `${currentMatch.homeTeam} ${homePenaltyScore} - ${awayPenaltyScore} ${currentMatch.awayTeam}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la predicción por penales.";

      Alert.alert("Error", errorMessage);
    }
  }

  async function deletePenaltyPrediction() {
    if (isPredictionLocked) {
      Alert.alert(
        "Predicciones cerradas",
        "Ya no puedes eliminar predicciones por penales para este partido.",
      );
      return;
    }

    try {
      await deletePenaltyPredictionSilently();

      Alert.alert(
        "Penales eliminados",
        "Tu predicción por penales fue eliminada.",
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la predicción por penales.";

      Alert.alert("Error", errorMessage);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <ScreenHeader
          title={`${currentMatch.homeTeam} vs ${currentMatch.awayTeam}`}
          subtitle={`${currentMatch.tournament} · ${currentMatch.group}`}
        />

        <View style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <View style={styles.matchHeaderText}>
              <Text style={styles.tournamentText}>
                {currentMatch.tournament}
              </Text>
              <Text style={styles.groupText}>{currentMatch.group}</Text>
            </View>

            <StatusBadge label={currentMatch.status} />
          </View>

          <View style={styles.teamsBox}>
            <TeamNameWithFlag
              teamName={currentMatch.homeTeam}
              flagUrl={currentMatch.homeTeamFlag}
            />

            <Text style={styles.vsText}>vs</Text>

            <TeamNameWithFlag
              teamName={currentMatch.awayTeam}
              flagUrl={currentMatch.awayTeamFlag}
            />
          </View>

          {currentMatch.actualHomeScore !== undefined &&
          currentMatch.actualAwayScore !== undefined ? (
            <View style={styles.finalScoreBox}>
              <Text style={styles.finalScoreLabel}>
                {currentMatch.status === "Finalizado"
                  ? "Resultado final"
                  : currentMatch.status === "En vivo"
                    ? "Marcador en vivo"
                    : "Marcador cargado"}
              </Text>
              <Text style={styles.finalScoreText}>
                {currentMatch.homeTeam} {currentMatch.actualHomeScore} -{" "}
                {currentMatch.actualAwayScore} {currentMatch.awayTeam}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {currentMatch.date} · {currentMatch.kickoffTime}
            </Text>

            {hasRealLocation(currentMatch) ? (
              <Text style={styles.infoText}>{locationText}</Text>
            ) : null}
          </View>
        </View>

        <PredictionStatusNotice status={currentMatch.status} />

        <View
          style={[
            styles.lockInfoCard,
            isPredictionLocked && styles.lockedInfoCard,
          ]}
        >
          <Text
            style={[
              styles.lockInfoTitle,
              isPredictionLocked && styles.lockedInfoTitle,
            ]}
          >
            {isPredictionLocked
              ? "Predicciones cerradas"
              : "Cierre de predicciones"}
          </Text>

          <Text
            style={[
              styles.lockInfoText,
              isPredictionLocked && styles.lockedInfoText,
            ]}
          >
            {predictionLockText}
          </Text>
        </View>

        {currentMatch.status === "Finalizado" ? (
          <PredictionPointsSummary
            match={currentMatch}
            savedPrediction={savedPrediction}
          />
        ) : (
          <View style={styles.pendingPointsCard}>
            <Text style={styles.pendingPointsTitle}>Puntos pendientes</Text>
            <Text style={styles.pendingPointsText}>
              El marcador puede actualizarse en vivo, pero los puntos se
              calcularán recién cuando el partido finalice.
            </Text>
          </View>
        )}

        <PredictionCard
          homeTeam={currentMatch.homeTeam}
          awayTeam={currentMatch.awayTeam}
          homeScore={homeScore}
          awayScore={awayScore}
          savedPrediction={savedPrediction}
          isPredictionLocked={isPredictionLocked}
          onDecreaseHomeScore={decreaseHomeScore}
          onIncreaseHomeScore={increaseHomeScore}
          onDecreaseAwayScore={decreaseAwayScore}
          onIncreaseAwayScore={increaseAwayScore}
          onSavePrediction={savePrediction}
          onDeletePrediction={deletePrediction}
        />

        {isKnockout ? (
          <View style={styles.knockoutInfoCard}>
            <Text style={styles.knockoutInfoTitle}>Partido eliminatorio</Text>
            <Text style={styles.knockoutInfoText}>
              Si pronosticas empate en los 120 minutos, podrás guardar también
              una predicción por penales.
            </Text>
          </View>
        ) : null}

        {shouldShowPenaltyPrediction ? (
          <PenaltyPredictionCard
            homeTeam={currentMatch.homeTeam}
            awayTeam={currentMatch.awayTeam}
            homePenaltyScore={homePenaltyScore}
            awayPenaltyScore={awayPenaltyScore}
            isPredictionLocked={isPredictionLocked}
            hasSavedPenaltyPrediction={!!penaltyPrediction}
            onDecreaseHomePenaltyScore={decreaseHomePenaltyScore}
            onIncreaseHomePenaltyScore={increaseHomePenaltyScore}
            onDecreaseAwayPenaltyScore={decreaseAwayPenaltyScore}
            onIncreaseAwayPenaltyScore={increaseAwayPenaltyScore}
            onSavePenaltyPrediction={savePenaltyPrediction}
            onDeletePenaltyPrediction={deletePenaltyPrediction}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  notFoundScreen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  matchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  matchHeaderText: {
    flex: 1,
  },
  tournamentText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  groupText: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },
  teamsBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  teamBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  flag: {
    width: 42,
    height: 30,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  flagPlaceholder: {
    width: 42,
    height: 30,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  vsText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9CA3AF",
  },
  finalScoreBox: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#ECFDF5",
    padding: 14,
  },
  finalScoreLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#047857",
    marginBottom: 4,
  },
  finalScoreText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#065F46",
  },
  infoBox: {
    marginTop: 16,
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  lockInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  lockedInfoCard: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  lockInfoTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  lockedInfoTitle: {
    color: "#991B1B",
  },
  lockInfoText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  lockedInfoText: {
    color: "#7F1D1D",
  },
  pendingPointsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  pendingPointsTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  pendingPointsText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  knockoutInfoCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginBottom: 16,
  },
  knockoutInfoTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#312E81",
    marginBottom: 6,
  },
  knockoutInfoText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#4338CA",
  },
});