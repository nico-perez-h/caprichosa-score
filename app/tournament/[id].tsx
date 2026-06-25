import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { MatchCard } from "@/components/MatchCard";
import { MatchFilters } from "@/components/MatchFilters";
import { MatchSearchInput } from "@/components/MatchSearchInput";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { tournaments } from "@/data/tournaments";
import { usePredictions } from "../../contexts/PredictionsContext";
import { getMatchesByTournament } from "../../services/matchesService";
import type { Match } from "../../types/match";
import { filterMatches, type MatchFilter } from "../../utils/matchFilters";

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPrediction } = usePredictions();

  const [selectedFilter, setSelectedFilter] = useState<MatchFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [tournamentMatches, setTournamentMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  const tournament = tournaments.find((item) => item.id === id);

  useEffect(() => {
    async function loadTournamentMatches() {
      if (!id) {
        setIsLoadingMatches(false);
        return;
      }

      setIsLoadingMatches(true);

      const loadedMatches = await getMatchesByTournament(id);

      setTournamentMatches(loadedMatches);
      setIsLoadingMatches(false);
    }

    loadTournamentMatches();
  }, [id]);

  const filteredTournamentMatches = filterMatches({
    matches: tournamentMatches,
    selectedFilter,
    searchTerm,
    hasPrediction: (matchId) => Boolean(getPrediction(matchId)),
  });

  if (!tournament) {
    return (
      <View style={styles.screen}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <Text style={styles.notFoundTitle}>Torneo no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </Pressable>

      <ScreenHeader title={tournament.name} subtitle={tournament.description} />

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <StatusBadge label={tournament.status} />
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Partidos disponibles</Text>
          <Text style={styles.summaryValue}>{tournamentMatches.length}</Text>
        </View>

        <Text style={styles.summaryText}>
          Busca equipos, filtra los partidos de este torneo y entra al que
          quieras predecir.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Partidos</Text>

      <MatchSearchInput
        searchTerm={searchTerm}
        onChangeSearchTerm={setSearchTerm}
      />

      <View style={styles.filtersWrapper}>
        <MatchFilters
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
        />
      </View>

      {isLoadingMatches ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Cargando partidos...</Text>
          <Text style={styles.emptyText}>
            Estamos preparando los partidos de este torneo.
          </Text>
        </View>
      ) : null}

      {!isLoadingMatches ? (
        <FlatList
          data={filteredTournamentMatches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              savedPrediction={getPrediction(item.id)}
              onPress={() => router.push(`/match/${item.id}` as never)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No encontramos partidos</Text>
              <Text style={styles.emptyText}>
                Prueba con otro equipo o cambia el filtro seleccionado.
              </Text>
            </View>
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 24,
    paddingTop: 64,
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
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 24,
    gap: 12,
  },
  filtersWrapper: {
    marginBottom: 18,
    zIndex: 2,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
});
