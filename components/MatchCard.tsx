import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import type { Match } from '@/types/match';

type MatchCardProps = {
  match: Match;
};

export function MatchCard({ match }: MatchCardProps) {
  return (
    <View style={styles.card}>
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
    </View>
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
});