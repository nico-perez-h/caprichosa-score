import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { usePredictions } from '../contexts/PredictionsContext';
import { getFinishedMatches } from '../services/matchesService';
import type { Match } from '../types/match';

export default function ResultsScreen() {
  const { getPrediction } = usePredictions();

  const [finishedMatches, setFinishedMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  useEffect(() => {
    async function loadFinishedMatches() {
      setIsLoadingMatches(true);

      const loadedMatches = await getFinishedMatches();

      setFinishedMatches(loadedMatches);
      setIsLoadingMatches(false);
    }

    loadFinishedMatches();
  }, []);

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
          title="Resultados"
          subtitle="Revisa partidos finalizados, resultados y tus predicciones."
        />

        {isLoadingMatches ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Cargando resultados...</Text>
            <Text style={styles.emptyText}>
              Estamos buscando los partidos finalizados del Mundial.
            </Text>
          </View>
        ) : null}

        {!isLoadingMatches && finishedMatches.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aún no hay resultados</Text>
            <Text style={styles.emptyText}>
              Cuando haya partidos finalizados, aparecerán aquí.
            </Text>
          </View>
        ) : null}

        {!isLoadingMatches
          ? finishedMatches.map((match) => (
              <View key={match.id} style={styles.matchWrapper}>
                <MatchCard
                  match={match}
                  savedPrediction={getPrediction(match.id)}
                  onPress={() => router.push(`/match/${match.id}` as never)}
                />
              </View>
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
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
  matchWrapper: {
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
});