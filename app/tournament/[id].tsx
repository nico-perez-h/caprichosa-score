import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { MatchCard } from "@/components/MatchCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { matches } from "@/data/matches";
import { tournaments } from "@/data/tournaments";

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const tournament = tournaments.find((item) => item.id === id);
  const tournamentMatches = matches.filter(
    (match) => match.tournamentId === id,
  );

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
          Aquí verás los partidos de este torneo y luego podrás hacer tus
          predicciones.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Partidos</Text>

      <FlatList
        data={tournamentMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => router.push(`/match/${item.id}` as never)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Todavía no hay partidos para este torneo.
          </Text>
        }
      />
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
    paddingBottom: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
});
