import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { matches } from '@/data/matches';

type SavedPrediction = {
  homeScore: number;
  awayScore: number;
};

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const match = matches.find((item) => item.id === id);

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [savedPrediction, setSavedPrediction] = useState<SavedPrediction | null>(null);

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

      <View style={styles.predictionCard}>
        <Text style={styles.predictionTitle}>Tu predicción</Text>
        <Text style={styles.predictionText}>
          Elige cuántos goles crees que hará cada equipo.
        </Text>

        <View style={styles.scoreSelector}>
          <View style={styles.scoreColumn}>
            <Text style={styles.scoreTeam}>{currentMatch.homeTeam}</Text>

            <View style={styles.scoreControls}>
              <Pressable style={styles.scoreButton} onPress={decreaseHomeScore}>
                <Text style={styles.scoreButtonText}>−</Text>
              </Pressable>

              <Text style={styles.scoreNumber}>{homeScore}</Text>

              <Pressable style={styles.scoreButton} onPress={increaseHomeScore}>
                <Text style={styles.scoreButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.scoreSeparator}>-</Text>

          <View style={styles.scoreColumn}>
            <Text style={styles.scoreTeam}>{currentMatch.awayTeam}</Text>

            <View style={styles.scoreControls}>
              <Pressable style={styles.scoreButton} onPress={decreaseAwayScore}>
                <Text style={styles.scoreButtonText}>−</Text>
              </Pressable>

              <Text style={styles.scoreNumber}>{awayScore}</Text>

              <Pressable style={styles.scoreButton} onPress={increaseAwayScore}>
                <Text style={styles.scoreButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={savePrediction}>
          <Text style={styles.primaryButtonText}>
            {savedPrediction ? 'Actualizar predicción' : 'Guardar predicción'}
          </Text>
        </Pressable>

        {savedPrediction ? (
          <View style={styles.savedPredictionBox}>
            <Text style={styles.savedPredictionTitle}>Predicción guardada</Text>

            <Text style={styles.savedPredictionScore}>
              {currentMatch.homeTeam} {savedPrediction.homeScore} -{' '}
              {savedPrediction.awayScore} {currentMatch.awayTeam}
            </Text>
          </View>
        ) : null}
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
  scoreSelector: {
    marginTop: 22,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreColumn: {
    flex: 1,
    alignItems: 'center',
  },
  scoreTeam: {
    minHeight: 34,
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButtonText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  scoreNumber: {
    minWidth: 34,
    fontSize: 36,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  scoreSeparator: {
    fontSize: 28,
    fontWeight: '900',
    color: '#D1D5DB',
    paddingHorizontal: 8,
    marginTop: 34,
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
  savedPredictionBox: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    padding: 14,
  },
  savedPredictionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 6,
  },
  savedPredictionScore: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
});