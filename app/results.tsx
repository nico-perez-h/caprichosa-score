import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { usePredictions } from '../contexts/PredictionsContext';
import { getFinishedMatches } from '../services/matchesService';
import type { Match } from '../types/match';

type ResultsSection = {
  title: string;
  description: string;
  data: Match[];
};

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

  const matchesWithPrediction = finishedMatches.filter((match) =>
    Boolean(getPrediction(match.id))
  );

  const matchesWithoutPrediction = finishedMatches.filter(
    (match) => !getPrediction(match.id)
  );

  const sections: ResultsSection[] = [
    {
      title: 'Con predicción',
      description: 'Partidos finalizados donde guardaste una predicción.',
      data: matchesWithPrediction,
    },
    {
      title: 'Sin predicción',
      description: 'Partidos finalizados donde no guardaste predicción.',
      data: matchesWithoutPrediction,
    },
  ].filter((section) => section.data.length > 0);

  return (
    <SafeAreaView style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Volver</Text>
            </Pressable>

            <ScreenHeader
              title="Resultados"
              subtitle="Revisa partidos finalizados, resultados y tus predicciones."
            />

            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{finishedMatches.length}</Text>
                <Text style={styles.summaryLabel}>Finalizados</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {matchesWithPrediction.length}
                </Text>
                <Text style={styles.summaryLabel}>Con predicción</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {matchesWithoutPrediction.length}
                </Text>
                <Text style={styles.summaryLabel}>Sin predicción</Text>
              </View>
            </View>

            {isLoadingMatches ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Cargando resultados...</Text>
                <Text style={styles.emptyText}>
                  Estamos buscando los partidos finalizados del Mundial.
                </Text>
              </View>
            ) : null}
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionDescription}>{section.description}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.matchWrapper}>
            <MatchCard
              match={item}
              savedPrediction={getPrediction(item.id)}
              onPress={() => router.push(`/match/${item.id}` as never)}
            />
          </View>
        )}
        ListEmptyComponent={
          !isLoadingMatches ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Aún no hay resultados</Text>
              <Text style={styles.emptyText}>
                Cuando haya partidos finalizados, aparecerán aquí.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#E5E7EB',
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  sectionDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
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
    marginBottom: 16,
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