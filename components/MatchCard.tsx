import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import type { Match } from '@/types/match';

type MatchPrediction = {
  homeScore: number;
  awayScore: number;
};

type MatchCardProps = {
  match: Match;
  savedPrediction?: MatchPrediction | null;
  onPress?: () => void;
};

export function MatchCard({ match, savedPrediction, onPress }: MatchCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressedCard]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.tournament}>{match.tournament}</Text>
        <StatusBadge label={match.status} />
      </View>

      <View style={styles.matchRow}>
        <Text style={styles.team}>{match.homeTeam}</Text>
        <Text style={styles.vs}>vs</Text>
        <Text style={styles.team}>{match.awayTeam}</Text>
      </View>

      <Text style={styles.date}>{match.date}</Text>

      {savedPrediction ? (
        <View style={styles.predictionBox}>
          <Text style={styles.predictionLabel}>Predicción guardada</Text>
          <Text style={styles.predictionScore}>
            {match.homeTeam} {savedPrediction.homeScore} -{' '}
            {savedPrediction.awayScore} {match.awayTeam}
          </Text>
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
  tournament: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
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
  date: {
    marginTop: 12,
    fontSize: 14,
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
});