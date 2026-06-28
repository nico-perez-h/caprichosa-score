import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  getManualMatchResults,
  upsertManualMatchResult,
  type ManualMatchResult,
} from "@/services/matchResultsService";
import { getMatches } from "@/services/matchesService";
import type { Match } from "@/types/match";

type UserRole = "user" | "super_admin";

export default function SuperAdminResultsScreen() {
  const { user } = useAuth();

  const [role, setRole] = useState<UserRole>("user");
  const [matches, setMatches] = useState<Match[]>([]);
  const [manualResults, setManualResults] = useState<ManualMatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const editableMatches = useMemo(() => {
    return matches
      .filter(
        (match) => match.status === "Por jugar" || match.status === "En vivo",
      )
      .slice(0, 40);
  }, [matches]);

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("app_role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      const loadedRole = (profile?.app_role ?? "user") as UserRole;

      setRole(loadedRole);

      if (loadedRole !== "super_admin") {
        return;
      }

      const [loadedMatches, loadedManualResults] = await Promise.all([
        getMatches(),
        getManualMatchResults(),
      ]);

      setMatches(loadedMatches);
      setManualResults(loadedManualResults);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo cargar la pantalla.";

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  function handleSelectMatch(match: Match) {
    const existingResult = manualResults.find(
      (result) => result.match_id === match.id,
    );

    setSelectedMatch(match);
    setHomeScore(existingResult?.home_score ?? 0);
    setAwayScore(existingResult?.away_score ?? 0);
  }

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

  async function handleSaveResult() {
    if (!user || !selectedMatch) {
      Alert.alert("Error", "Selecciona un partido para guardar marcador.");
      return;
    }

    if (selectedMatch.status === "Finalizado") {
      Alert.alert(
        "Partido finalizado",
        "Este partido ya finalizó y no se puede modificar.",
      );
      return;
    }

    try {
      setIsSaving(true);

      await upsertManualMatchResult({
        matchId: selectedMatch.id,
        homeScore,
        awayScore,
        status: selectedMatch.status,
        updatedBy: user.id,
      });

      Alert.alert(
        "Marcador guardado",
        `${selectedMatch.homeTeam} ${homeScore} - ${awayScore} ${selectedMatch.awayTeam}`,
      );

      await loadData();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo guardar el marcador.";

      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContent}>
          <ActivityIndicator color="#111827" />
          <Text style={styles.loadingText}>Cargando panel interno...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (role !== "super_admin") {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>

          <ScreenHeader
            title="Panel interno"
            subtitle="Esta pantalla es solo para el super administrador."
          />

          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin permiso</Text>
            <Text style={styles.emptyText}>
              Tu cuenta no tiene permiso para cargar marcadores manuales.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <ScreenHeader
          title="Panel interno"
          subtitle="Actualiza marcadores manualmente mientras el partido está por jugar o en vivo."
        />

        <View style={styles.selectedCard}>
          <Text style={styles.cardTitle}>Marcador seleccionado</Text>

          {selectedMatch ? (
            <>
              <Text style={styles.matchTitle}>
                {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
              </Text>

              <Text style={styles.matchMeta}>
                {selectedMatch.group} · {selectedMatch.date} ·{" "}
                {selectedMatch.status}
              </Text>

              <View style={styles.scoreRow}>
                <View style={styles.teamScoreBox}>
                  <Text style={styles.teamName}>{selectedMatch.homeTeam}</Text>

                  <View style={styles.scoreControls}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.scoreButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={decreaseHomeScore}
                      disabled={isSaving}
                    >
                      <MaterialCommunityIcons
                        name="minus"
                        size={26}
                        color="#111827"
                      />
                    </Pressable>

                    <Text style={styles.scoreValue}>{homeScore}</Text>

                    <Pressable
                      style={({ pressed }) => [
                        styles.scoreButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={increaseHomeScore}
                      disabled={isSaving}
                    >
                      <MaterialCommunityIcons
                        name="plus"
                        size={26}
                        color="#111827"
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.teamScoreBox}>
                  <Text style={styles.teamName}>{selectedMatch.awayTeam}</Text>

                  <View style={styles.scoreControls}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.scoreButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={decreaseAwayScore}
                      disabled={isSaving}
                    >
                      <MaterialCommunityIcons
                        name="minus"
                        size={26}
                        color="#111827"
                      />
                    </Pressable>

                    <Text style={styles.scoreValue}>{awayScore}</Text>

                    <Pressable
                      style={({ pressed }) => [
                        styles.scoreButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={increaseAwayScore}
                      disabled={isSaving}
                    >
                      <MaterialCommunityIcons
                        name="plus"
                        size={26}
                        color="#111827"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                  isSaving && styles.disabledButton,
                ]}
                onPress={handleSaveResult}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Guardando..." : "Guardar marcador"}
                </Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.emptyText}>
              Selecciona un partido de la lista para cargar el marcador.
            </Text>
          )}
        </View>

        <View style={styles.matchesCard}>
          <Text style={styles.cardTitle}>Partidos disponibles</Text>

          {editableMatches.length === 0 ? (
            <View style={styles.emptyEditableBox}>
              <Text style={styles.emptyTitle}>No hay partidos disponibles</Text>
              <Text style={styles.emptyText}>
                Solo aparecen partidos por jugar o en vivo. Los partidos
                finalizados ya no se pueden editar.
              </Text>
            </View>
          ) : (
            editableMatches.map((match) => {
              const manualResult = manualResults.find(
                (result) => result.match_id === match.id,
              );

              const isSelected = selectedMatch?.id === match.id;

              return (
                <Pressable
                  key={match.id}
                  style={({ pressed }) => [
                    styles.matchRow,
                    isSelected && styles.selectedMatchRow,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => handleSelectMatch(match)}
                >
                  <View style={styles.matchInfo}>
                    <Text
                      style={[
                        styles.matchTeams,
                        isSelected && styles.selectedMatchText,
                      ]}
                    >
                      {match.homeTeam} vs {match.awayTeam}
                    </Text>

                    <Text
                      style={[
                        styles.matchSmallMeta,
                        isSelected && styles.selectedMatchMetaText,
                      ]}
                    >
                      {match.group} · {match.date} · {match.status}
                    </Text>
                  </View>

                  {manualResult ? (
                    <View
                      style={[
                        styles.resultPill,
                        isSelected && styles.selectedResultPill,
                      ]}
                    >
                      <Text
                        style={[
                          styles.resultPillText,
                          isSelected && styles.selectedResultPillText,
                        ]}
                      >
                        {manualResult.home_score}-{manualResult.away_score}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.selectText,
                        isSelected && styles.selectedMatchText,
                      ]}
                    >
                      Elegir
                    </Text>
                  )}
                </Pressable>
              );
            })
          )}
        </View>
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
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
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
  selectedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  matchesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  matchMeta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  scoreRow: {
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  teamScoreBox: {
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  teamName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  scoreControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreButton: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  scoreValue: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 10,
  },
  selectedMatchRow: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  matchInfo: {
    flex: 1,
  },
  matchTeams: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },
  matchSmallMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  selectText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111827",
  },
  selectedMatchText: {
    color: "#FFFFFF",
  },
  selectedMatchMetaText: {
    color: "#D1D5DB",
  },
  resultPill: {
    borderRadius: 999,
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectedResultPill: {
    backgroundColor: "#FFFFFF",
  },
  resultPillText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  selectedResultPillText: {
    color: "#111827",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyEditableBox: {
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});