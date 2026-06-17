import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/StatusBadge';
import type { Tournament } from '@/types/tournament';

type TournamentCardProps = {
  tournament: Tournament;
  onPress?: () => void;
};

export function TournamentCard({ tournament, onPress }: TournamentCardProps) {
  const isDisabled = tournament.status !== 'Disponible';

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isDisabled && styles.disabledCard,
        pressed && styles.pressedCard,
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{tournament.name}</Text>
        <StatusBadge label={tournament.status} />
      </View>

      <Text style={styles.cardText}>{tournament.description}</Text>
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
  disabledCard: {
    opacity: 0.65,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
});