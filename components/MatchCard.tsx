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

function hasRealLocation(match: Match) {
  const hasStadium =
    match.stadium &&
    match.stadium !== 'Estadio no disponible' &&
    match.stadium !== 'No disponible';

  const hasCity =
    match.city &&
    match.city !== 'Ciudad no disponible' &&
    match.city !== 'No disponible';

  return Boolean(hasStadium || hasCity);
}

function getLocationText(match: Match) {
  const locationParts = [match.stadium, match.city].filter(
    (item) =>
      item &&
      item !== 'Estadio no disponible' &&
      item !== 'Ciudad no disponible' &&
      item !== 'No disponible'
  );

  return locationParts.join(' · ');
}

export function MatchCard({
  match,
  savedPrediction,
  onPress,
}: MatchCardProps) {
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

  const locationText = getLocationText(match);

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

        {hasRealLocation(match) ? (
          <Text style={styles.infoText}>{locationText}</Text>
        ) : null}
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
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pressedCard: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
  },
  tournament: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
  },
  group: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  team: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  vs: {
    fontSize: 13,
    fontWeight: '900',
    color: '#9CA3AF',
  },
  resultBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 4,
  },
  resultScore: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    color: '#6B7280',
  },
  predictionBox: {
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#047857',
    marginBottom: 4,
  },
  predictionScore: {
    fontSize: 14,
    fontWeight: '900',
    color: '#065F46',
  },
  pointsText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '900',
    color: '#047857',
  },
  pendingPointsText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
});