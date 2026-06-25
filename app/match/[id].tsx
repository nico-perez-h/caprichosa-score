import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PredictionCard } from '@/components/PredictionCard';
import { PredictionPointsSummary } from '@/components/PredictionPointsSummary';
import { PredictionStatusNotice } from '@/components/PredictionStatusNotice';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { usePredictions } from '../../contexts/PredictionsContext';
import { getMatchById } from '../../services/matchesService';
import type { Match } from '../../types/match';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getPrediction,
    savePrediction: savePredictionInStore,
    deletePrediction: deletePredictionInStore,
  } = usePredictions();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  useEffect(() => {
    async function loadMatch() {
      if (!id) {
        setIsLoadingMatch(false);
        return;
      }

      setIsLoadingMatch(true);

      const loadedMatch = await getMatchById(id);

      setMatch(loadedMatch);

      if (loadedMatch) {
        const savedPrediction = getPrediction(loadedMatch.id);

        if (savedPrediction) {
          setHomeScore(savedPrediction.homeScore);
          setAwayScore(savedPrediction.awayScore);
        } else {
          setHomeScore(0);
          setAwayScore(0);
        }
      }

      setIsLoadingMatch(false);
    }

    loadMatch();
  }, [id, getPrediction]);

  if (isLoadingMatch) {
    return (
      <SafeAreaView style={styles.notFoundScreen}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <Text style={styles.notFoundTitle}>Cargando partido...</Text>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.notFoundScreen}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <Text style={styles.notFoundTitle}>Partido no encontrado</Text>
      </SafeAreaView>
    );
  }

  const currentMatch = match;
  const savedPrediction = getPrediction(currentMatch.id);
  const isPredictionLocked = currentMatch.status !== 'Por jugar';

  function decreaseHomeScore() {
    setHomeScore((currentScore) => Math.max(0, currentScore - 1));
  }

  function increaseHomeScore() {
    setHomeScore((currentScore) => currentScore + 1);
  }

  function decreaseAwayScore() {
    setAwayScore((currentScore) => Math.max(0, currentScore - 1));
  }

  function increaseAwayScore() {
    setAwayScore((currentScore) => currentScore + 1);
  }

  function savePrediction() {
    if (isPredictionLocked) {
      Alert.alert(
        'Predicciones cerradas',
        'Ya no puedes guardar predicciones para este partido.'
      );
      return;
    }

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
    if (isPredictionLocked) {
      Alert.alert(
        'Predicciones cerradas',
        'Ya no puedes eliminar predicciones para este partido.'
      );
      return;
    }

    deletePredictionInStore(currentMatch.id);
    setHomeScore(0);
    setAwayScore(0);

    Alert.alert('Predicción eliminada', 'Tu predicción fue eliminada.');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <ScreenHeader
          title={`${currentMatch.homeTeam} vs ${currentMatch.awayTeam}`}
          subtitle={`${currentMatch.tournament} · ${currentMatch.group}`}
        />

        <View style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <View style={styles.matchHeaderText}>
              <Text style={styles.tournamentText}>
                {currentMatch.tournament}
              </Text>
              <Text style={styles.groupText}>{currentMatch.group}</Text>
            </View>

            <StatusBadge label={currentMatch.status} />
          </View>

          <View style={styles.teamsBox}>
            <Text style={styles.teamName}>{currentMatch.homeTeam}</Text>
            <Text style={styles.vsText}>vs</Text>
            <Text style={styles.teamName}>{currentMatch.awayTeam}</Text>
          </View>

          {currentMatch.actualHomeScore !== undefined &&
          currentMatch.actualAwayScore !== undefined ? (
            <View style={styles.finalScoreBox}>
              <Text style={styles.finalScoreLabel}>Resultado final</Text>
              <Text style={styles.finalScoreText}>
                {currentMatch.homeTeam} {currentMatch.actualHomeScore} -{' '}
                {currentMatch.actualAwayScore} {currentMatch.awayTeam}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {currentMatch.date} · {currentMatch.kickoffTime}
            </Text>
            <Text style={styles.infoText}>
              {currentMatch.stadium} · {currentMatch.city}
            </Text>
          </View>
        </View>

        <PredictionStatusNotice status={currentMatch.status} />

        <PredictionPointsSummary
          match={currentMatch}
          savedPrediction={savedPrediction}
        />

        <PredictionCard
          homeTeam={currentMatch.homeTeam}
          awayTeam={currentMatch.awayTeam}
          homeScore={homeScore}
          awayScore={awayScore}
          savedPrediction={savedPrediction}
          isPredictionLocked={isPredictionLocked}
          onDecreaseHomeScore={decreaseHomeScore}
          onIncreaseHomeScore={increaseHomeScore}
          onDecreaseAwayScore={decreaseAwayScore}
          onIncreaseAwayScore={increaseAwayScore}
          onSavePrediction={savePrediction}
          onDeletePrediction={deletePrediction}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  notFoundScreen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingTop: 24,
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
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  matchHeaderText: {
    flex: 1,
  },
  tournamentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  groupText: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  teamsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  teamName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  finalScoreBox: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    padding: 14,
  },
  finalScoreLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#047857',
    marginBottom: 4,
  },
  finalScoreText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#065F46',
  },
  infoBox: {
    marginTop: 16,
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
});