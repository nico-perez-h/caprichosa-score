import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { MatchCard } from '@/components/MatchCard';
import { ScoringRulesCard } from '@/components/ScoringRulesCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { getMatches } from '@/services/matchesService';
import type { Match } from '@/types/match';
import { usePredictions } from '../../contexts/PredictionsContext';
import { calculateTotalPredictionPoints } from '../../utils/scoring';

type PredictionSection = {
  title: string;
  description: string;
  data: Match[];
};

function parseMatchDate(match: Match) {
  const [day, month, year] = match.date.split('/');
  const [hour, minute] = match.kickoffTime.split(':');

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  ).getTime();
}

function sortMatchesByDate(matches: Match[]) {
  return [...matches].sort((firstMatch, secondMatch) => {
    return parseMatchDate(firstMatch) - parseMatchDate(secondMatch);
  });
}

function isPlaceholderTeam(teamName: string) {
  const cleanTeamName = teamName.trim().toLowerCase();

  return (
    cleanTeamName.includes('tbd') ||
    cleanTeamName.includes('por definir') ||
    cleanTeamName.includes('winner') ||
    cleanTeamName.includes('ganador') ||
    cleanTeamName.includes('1st group') ||
    cleanTeamName.includes('2nd group') ||
    cleanTeamName.includes('3rd group') ||
    cleanTeamName.includes('local') ||
    cleanTeamName.includes('visitante')
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

export default function PredictionsScreen() {
  const { predictions, getPrediction } = usePredictions();

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

  const predictedMatches = allMatches.filter((match) =>
    Boolean(predictions[match.id])
  );

  const availableMatchesWithoutPrediction = sortMatchesByDate(
    allMatches.filter(
      (match) =>
        match.status === 'Por jugar' &&
        isConfirmedMatch(match) &&
        !predictions[match.id]
    )
  );

  const pendingPredictedMatches = sortMatchesByDate(
    predictedMatches.filter((match) => match.status === 'Por jugar')
  );

  const finishedPredictedMatches = sortMatchesByDate(
    predictedMatches.filter(
      (match) =>
        match.actualHomeScore !== undefined &&
        match.actualAwayScore !== undefined
    )
  );

  const totalPoints = calculateTotalPredictionPoints(allMatches, predictions);
  const totalPredictions = predictedMatches.length;

  const sections: PredictionSection[] = [
    {
      title: 'Por hacer',
      description:
        'Partidos confirmados donde todavía puedes guardar una predicción.',
      data: availableMatchesWithoutPrediction,
    },
    {
      title: 'Pendientes',
      description: 'Predicciones guardadas que todavía esperan resultado final.',
      data: pendingPredictedMatches,
    },
    {
      title: 'Finalizadas',
      description: 'Predicciones que ya tienen puntos calculados.',
      data: finishedPredictedMatches,
    },
  ].filter((section) => section.data.length > 0);

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <ScreenHeader
              title="Predicciones"
              subtitle="Guarda nuevas predicciones y revisa las que ya hiciste."
            />

            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalPoints}</Text>
                <Text style={styles.summaryLabel}>Puntos</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalPredictions}</Text>
                <Text style={styles.summaryLabel}>Predicciones</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {availableMatchesWithoutPrediction.length}
                </Text>
                <Text style={styles.summaryLabel}>Por hacer</Text>
              </View>
            </View>

            <ScoringRulesCard />
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionDescription}>{section.description}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.matchCardWrapper}>
            <MatchCard
              match={item}
              savedPrediction={getPrediction(item.id)}
              onPress={() => router.push(`/match/${item.id}` as never)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {isLoadingMatches
                ? 'Cargando predicciones...'
                : 'No hay predicciones pendientes'}
            </Text>

            <Text style={styles.emptyText}>
              {isLoadingMatches
                ? 'Estamos revisando tus partidos y predicciones guardadas.'
                : 'Cuando haya partidos confirmados disponibles, aparecerán aquí.'}
            </Text>
          </View>
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
    paddingTop: 72,
  },
  list: {
    paddingBottom: 24,
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
    fontSize: 26,
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
  matchCardWrapper: {
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