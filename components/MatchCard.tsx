import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import type { Match } from '@/types/match';
import { calculatePredictionPoints } from '@/utils/scoring';

type MatchPrediction = {
  matchId?: string;
  homeScore: number;
  awayScore: number;
};

type MatchCardProps = {
  match: Match;
  savedPrediction?: MatchPrediction | null;
  onPress?: () => void;
};

export function MatchCard({ match, savedPrediction, onPress }: MatchCardProps) {
  const points = calculatePredictionPoints(
    match,
    savedPrediction
      ? {
          matchId: savedPrediction.matchId ?? match.id,
          homeScore: savedPrediction.homeScore,
          awayScore: savedPrediction.awayScore,
        }
      : null
  );

  const hasFinalScore =
    match.actualHomeScore !== undefined && match.actualAwayScore !== undefined;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressedCard]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerText}>
          <Text style={styles.tournament}>{match.tournament}</Text>
          <Text style={styles.group}>{match.group}</Text>
        </View>

        <StatusBadge label={match.status} />
      </View>

      <View style={styles.matchRow}>
        <Text style={styles.team}>{match.homeTeam}</Text>
        <Text style={styles.vs}>vs</Text>
        <Text style={styles.team}>{match.awayTeam}</Text>
      </View>

      {hasFinalScore ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Resultado final</Text>
          <Text style={styles.resultScore}>
            {match.homeTeam} {match.actualHomeScore} - {match.actualAwayScore}{' '}
            {match.awayTeam}
          </Text>
        </View>
      ) : null}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {match.date} · {match.kickoffTime}
        </Text>
        <Text style={styles.infoText}>
          {match.stadium} · {match.city}
        </Text>
      </View>

      {savedPrediction ? (
        <View style={styles.predictionBox}>
          <Text style={styles.predictionLabel}>Predicción guardada</Text>
          <Text style={styles.predictionScore}>
            {match.homeTeam} {savedPrediction.homeScore} -{' '}
            {savedPrediction.awayScore} {match.awayTeam}
          </Text>

          {points !== null ? (
            <Text style={styles.pointsText}>{points} puntos</Text>
          ) : (
            <Text style={styles.pendingPointsText}>Puntos pendientes</Text>
          )}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pressedCard: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  tournament: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  group: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  vs: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    paddingHorizontal: 12,
  },
  resultBox: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    padding: 12,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#047857',
    marginBottom: 4,
  },
  resultScore: {
    fontSize: 14,
    fontWeight: '900',
    color: '#065F46',
  },
  infoBox: {
    marginTop: 14,
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  predictionBox: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    padding: 12,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 4,
  },
  predictionScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  pointsText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '900',
    color: '#047857',
  },
  pendingPointsText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
  },
});