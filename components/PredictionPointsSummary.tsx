import { StyleSheet, Text, View } from 'react-native';

import type { Prediction } from '../contexts/PredictionsContext';
import type { Match } from '../types/match';
import { calculatePredictionPoints } from '../utils/scoring';

type PredictionPointsSummaryProps = {
  match: Match;
  savedPrediction: Prediction | null;
};

export function PredictionPointsSummary({
  match,
  savedPrediction,
}: PredictionPointsSummaryProps) {
  const hasFinalScore =
    match.actualHomeScore !== undefined && match.actualAwayScore !== undefined;

  const points = calculatePredictionPoints(match, savedPrediction);

  if (!savedPrediction) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Puntos de este partido</Text>
        <Text style={styles.description}>
          Todavía no tienes una predicción guardada para este partido.
        </Text>
      </View>
    );
  }

  if (!hasFinalScore) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Puntos de este partido</Text>
        <Text style={styles.pendingText}>Puntos pendientes</Text>
        <Text style={styles.description}>
          Cuando el partido termine, aquí se calcularán tus puntos.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Puntos de este partido</Text>

      <View style={styles.pointsRow}>
        <Text style={styles.pointsNumber}>{points}</Text>
        <Text style={styles.pointsLabel}>
          {points === 1 ? 'punto obtenido' : 'puntos obtenidos'}
        </Text>
      </View>

      <Text style={styles.description}>
        Resultado final: {match.homeTeam} {match.actualHomeScore} -{' '}
        {match.actualAwayScore} {match.awayTeam}
      </Text>

      <Text style={styles.description}>
        Tu predicción: {match.homeTeam} {savedPrediction.homeScore} -{' '}
        {savedPrediction.awayScore} {match.awayTeam}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 10,
  },
  pointsNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#047857',
    lineHeight: 42,
  },
  pointsLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
    marginBottom: 5,
  },
  pendingText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6B7280',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
});