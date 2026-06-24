import { StyleSheet, Text, View } from 'react-native';

import type { Prediction } from '../contexts/PredictionsContext';
import type { Match } from '../types/match';
import { calculatePredictionPoints } from '../utils/scoring';

type PredictionPointsSummaryProps = {
  match: Match;
  savedPrediction: Prediction | null;
};

function getPointsTitle(points: number | null) {
  if (points === 3) {
    return 'Resultado exacto';
  }

  if (points === 1) {
    return 'Acertaste ganador o empate';
  }

  if (points === 0) {
    return 'No acertaste el resultado';
  }

  return 'Puntos pendientes';
}

function getPointsDescription(points: number | null) {
  if (points === 3) {
    return 'Acertaste los goles exactos de ambos equipos.';
  }

  if (points === 1) {
    return 'No acertaste el marcador exacto, pero sí acertaste si ganaba un equipo o si empataban.';
  }

  if (points === 0) {
    return 'Tu predicción no coincide con el ganador, empate o resultado final del partido.';
  }

  return 'Cuando el partido termine, aquí se calcularán tus puntos.';
}

export function PredictionPointsSummary({
  match,
  savedPrediction,
}: PredictionPointsSummaryProps) {
  const hasFinalScore =
    match.actualHomeScore !== undefined && match.actualAwayScore !== undefined;

  const points = calculatePredictionPoints(match, savedPrediction);
  const pointsTitle = getPointsTitle(points);
  const pointsDescription = getPointsDescription(points);

  if (!savedPrediction) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Puntos de este partido</Text>
        <Text style={styles.emptyTitle}>Sin predicción</Text>
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
        <Text style={styles.pendingText}>{pointsTitle}</Text>
        <Text style={styles.description}>{pointsDescription}</Text>

        <View style={styles.predictionBox}>
          <Text style={styles.predictionLabel}>Tu predicción</Text>
          <Text style={styles.predictionText}>
            {match.homeTeam} {savedPrediction.homeScore} -{' '}
            {savedPrediction.awayScore} {match.awayTeam}
          </Text>
        </View>
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

      <Text style={styles.resultTitle}>{pointsTitle}</Text>
      <Text style={styles.description}>{pointsDescription}</Text>

      <View style={styles.resultBox}>
        <Text style={styles.resultLabel}>Resultado final</Text>
        <Text style={styles.resultText}>
          {match.homeTeam} {match.actualHomeScore} - {match.actualAwayScore}{' '}
          {match.awayTeam}
        </Text>
      </View>

      <View style={styles.predictionBox}>
        <Text style={styles.predictionLabel}>Tu predicción</Text>
        <Text style={styles.predictionText}>
          {match.homeTeam} {savedPrediction.homeScore} -{' '}
          {savedPrediction.awayScore} {match.awayTeam}
        </Text>
      </View>
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
    marginBottom: 8,
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
  resultTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  pendingText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyTitle: {
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
  resultBox: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    padding: 12,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#047857',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#065F46',
  },
  predictionBox: {
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    padding: 12,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B7280',
    marginBottom: 4,
  },
  predictionText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
});