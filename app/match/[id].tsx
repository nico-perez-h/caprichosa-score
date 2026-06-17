import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  PredictionCard,
  type SavedPrediction,
} from '@/components/PredictionCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { matches } from '@/data/matches';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const match = matches.find((item) => item.id === id);

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [savedPrediction, setSavedPrediction] =
    useState<SavedPrediction | null>(null);

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

  const currentMatch = match;

  function decreaseHomeScore() {
    setHomeScore((currentScore) => Math.max(currentScore - 1, 0));
  }

  function increaseHomeScore() {
    setHomeScore((currentScore) => currentScore + 1);
  }

  function decreaseAwayScore() {
    setAwayScore((currentScore) => Math.max(currentScore - 1, 0));
  }

  function increaseAwayScore() {
    setAwayScore((currentScore) => currentScore + 1);
  }

  function savePrediction() {
    setSavedPrediction({
      homeScore,
      awayScore,
    });

    Alert.alert(
      'Predicción guardada',
      `${currentMatch.homeTeam} ${homeScore} - ${awayScore} ${currentMatch.awayTeam}`
    );
  }

  return (
    <View style={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </Pressable>

      <ScreenHeader
        title={`${currentMatch.homeTeam} vs ${currentMatch.awayTeam}`}
        subtitle={currentMatch.tournament}
      />

      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchDate}>{currentMatch.date}</Text>
          <StatusBadge label={currentMatch.status} />
        </View>

        <View style={styles.teamsRow}>
          <View style={styles.teamBox}>
            <Text style={styles.teamName}>{currentMatch.homeTeam}</Text>
          </View>

          <Text style={styles.vs}>vs</Text>

          <View style={styles.teamBox}>
            <Text style={styles.teamName}>{currentMatch.awayTeam}</Text>
          </View>
        </View>
      </View>

      <PredictionCard
        homeTeam={currentMatch.homeTeam}
        awayTeam={currentMatch.awayTeam}
        homeScore={homeScore}
        awayScore={awayScore}
        savedPrediction={savedPrediction}
        onDecreaseHomeScore={decreaseHomeScore}
        onIncreaseHomeScore={increaseHomeScore}
        onDecreaseAwayScore={decreaseAwayScore}
        onIncreaseAwayScore={increaseAwayScore}
        onSavePrediction={savePrediction}
      />
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
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
});