import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { matches } from '@/data/matches';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const match = matches.find((item) => item.id === id);

  if (!match) {
    return (
      <View style={styles.screen}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <Text style={styles.notFoundTitle}>Partido no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </Pressable>

      <ScreenHeader
        title={`${match.homeTeam} vs ${match.awayTeam}`}
        subtitle={match.tournament}
      />

      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchDate}>{match.date}</Text>
          <StatusBadge label={match.status} />
        </View>

        <View style={styles.teamsRow}>
          <View style={styles.teamBox}>
            <Text style={styles.teamName}>{match.homeTeam}</Text>
          </View>

          <Text style={styles.vs}>vs</Text>

          <View style={styles.teamBox}>
            <Text style={styles.teamName}>{match.awayTeam}</Text>
          </View>
        </View>
      </View>

      <View style={styles.predictionCard}>
        <Text style={styles.predictionTitle}>Tu predicción</Text>
        <Text style={styles.predictionText}>
          En el siguiente paso construiremos aquí el formulario para elegir el resultado del partido.
        </Text>

        <View style={styles.scorePreview}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>0</Text>
            <Text style={styles.scoreLabel}>{match.homeTeam}</Text>
          </View>

          <Text style={styles.scoreSeparator}>-</Text>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>0</Text>
            <Text style={styles.scoreLabel}>{match.awayTeam}</Text>
          </View>
        </View>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Hacer predicción</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingTop: 64,
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
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 18,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  matchDate: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamBox: {
    flex: 1,
    minHeight: 80,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  teamName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  vs: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
    paddingHorizontal: 12,
  },
  predictionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  predictionText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  scorePreview: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreBox: {
    flex: 1,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111827',
  },
  scoreLabel: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  scoreSeparator: {
    fontSize: 28,
    fontWeight: '900',
    color: '#D1D5DB',
    paddingHorizontal: 16,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
});