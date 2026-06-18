import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PredictionCard } from '@/components/PredictionCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { matches } from '@/data/matches';
import { usePredictions } from '../../contexts/PredictionsContext';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const match = matches.find((item) => item.id === id);

  const {
    getPrediction,
    savePrediction: savePredictionInStore,
    deletePrediction: deletePredictionInStore,
  } = usePredictions();

  const savedPrediction = match ? getPrediction(match.id) : null;

  const [homeScore, setHomeScore] = useState(savedPrediction?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(savedPrediction?.awayScore ?? 0);

  useEffect(() => {
    if (savedPrediction) {
      setHomeScore(savedPrediction.homeScore);
      setAwayScore(savedPrediction.awayScore);
    }
  }, [savedPrediction]);

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
    savePredictionInStore({
      matchId: currentMatch.id,
      homeScore,
      awayScore,
    });

    Alert.alert(
      'Predicción guardada',
      `${currentMatch.homeTeam} ${homeScore} - ${awayScore} ${currentMatch.awayTeam}`
    );
  }

  function deletePrediction() {
    Alert.alert(
      'Eliminar predicción',
      '¿Seguro que quieres eliminar esta predicción?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deletePredictionInStore(currentMatch.id);
            setHomeScore(0);
            setAwayScore(0);
          },
        },
      ]
    );
  }

  return (
    <View style={styles.screen}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Volver</Text>
      </Pressable>

      <ScreenHeader
        title={`${currentMatch.homeTeam} vs ${currentMatch.awayTeam}`}
        subtitle={`${currentMatch.tournament} · ${currentMatch.group}`}
      />

      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <View style={styles.matchInfo}>
            <Text style={styles.matchDate}>
              {currentMatch.date} · {currentMatch.kickoffTime}
            </Text>
            <Text style={styles.matchPlace}>
              {currentMatch.stadium} · {currentMatch.city}
            </Text>
          </View>

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
        onDeletePrediction={deletePrediction}
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
  matchInfo: {
    flex: 1,
  },
  matchDate: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  matchPlace: {
    marginTop: 4,
    fontSize: 13,
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