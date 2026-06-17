import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { matches } from '@/data/matches';
import { tournaments } from '@/data/tournaments';

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const tournament = tournaments.find((item) => item.id === id);
  const tournamentMatches = matches.filter((match) => match.tournamentId === id);

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

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <ScreenHeader title={tournament.name} subtitle={tournament.description} />
        </View>

        <StatusBadge label={tournament.status} />
      </View>

      <Text style={styles.sectionTitle}>Partidos</Text>

      <FlatList
        data={tournamentMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <MatchCard match={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Todavía no hay partidos para este torneo.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerRow: {
    marginBottom: 4,
  },
  headerText: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
});