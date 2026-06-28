import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { getGroupPointAdjustments } from '@/services/groupAdjustmentsService';
import { getCurrentGroup } from '@/services/groupsService';
import { getMatches } from '@/services/matchesService';
import type { Match } from '@/types/match';
import { usePredictions } from '../../contexts/PredictionsContext';
import { calculateTotalPredictionPoints } from '../../utils/scoring';

type PredictionFilter = 'pending' | 'predicted';

function parseMatchDate(match: Match) {
  const [day, month, year] = match.date.split('/');
  const [hour, minute] = match.kickoffTime.split(':');

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  ).getTime();
}

function sortMatchesByDate(matches: Match[]) {
  return [...matches].sort((firstMatch, secondMatch) => {
    return parseMatchDate(firstMatch) - parseMatchDate(secondMatch);
  });
}

function isPlaceholderTeam(teamName: string) {
  const cleanTeamName = teamName.trim().toLowerCase();

  return (
    cleanTeamName.includes('tbd') ||
    cleanTeamName.includes('por definir') ||
    cleanTeamName.includes('winner') ||
    cleanTeamName.includes('ganador') ||
    cleanTeamName.includes('1st group') ||
    cleanTeamName.includes('2nd group') ||
    cleanTeamName.includes('3rd group') ||
    cleanTeamName.includes('local') ||
    cleanTeamName.includes('visitante')
  );
}

function isConfirmedMatch(match: Match) {
  return (
    !isPlaceholderTeam(match.homeTeam) &&
    !isPlaceholderTeam(match.awayTeam) &&
    match.homeTeam.trim().length > 0 &&
    match.awayTeam.trim().length > 0
  );
}

function getEmptyTitle({
  isLoadingMatches,
  selectedFilter,
}: {
  isLoadingMatches: boolean;
  selectedFilter: PredictionFilter;
}) {
  if (isLoadingMatches) {
    return 'Cargando predicciones...';
  }

  if (selectedFilter === 'pending') {
    return 'No tienes partidos por hacer';
  }

  return 'No tienes predicciones guardadas';
}

function getEmptyText({
  isLoadingMatches,
  selectedFilter,
}: {
  isLoadingMatches: boolean;
  selectedFilter: PredictionFilter;
}) {
  if (isLoadingMatches) {
    return 'Estamos revisando tus partidos y predicciones guardadas.';
  }

  if (selectedFilter === 'pending') {
    return 'Cuando haya partidos confirmados sin predicción, aparecerán aquí.';
  }

  return 'Cuando guardes una predicción, aparecerá en esta sección.';
}

export default function PredictionsScreen() {
  const { predictions, getPrediction, reloadPredictions } = usePredictions();
  const { user } = useAuth();

  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [manualPoints, setManualPoints] = useState(0);
  const [selectedFilter, setSelectedFilter] =
    useState<PredictionFilter>('pending');

  const loadMatches = useCallback(async () => {
    setIsLoadingMatches(true);

    try {
      const loadedMatches = await getMatches();

      setAllMatches(loadedMatches);
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  const loadManualPoints = useCallback(async () => {
    if (!user) {
      setManualPoints(0);
      return;
    }

    try {
      const currentGroup = await getCurrentGroup();

      if (!currentGroup) {
        setManualPoints(0);
        return;
      }

      const pointAdjustments = await getGroupPointAdjustments(currentGroup.id);

      const userManualPoints = pointAdjustments
        .filter((adjustment) => adjustment.target_user_id === user.id)
        .reduce((total, adjustment) => total + adjustment.points, 0);

      setManualPoints(userManualPoints);
    } catch {
      setManualPoints(0);
    }
  }, [user]);

  async function handleRefresh() {
    try {
      setIsRefreshing(true);

      await Promise.all([loadMatches(), reloadPredictions(), loadManualPoints()]);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadMatches();
    loadManualPoints();
  }, [loadMatches, loadManualPoints]);

  function showScoringRules() {
    Alert.alert(
      'Reglas de puntuación',
      'Resultado exacto: 3 puntos\nGanador o empate correcto: 1 punto\nResultado incorrecto: 0 puntos'
    );
  }

  const predictedMatches = allMatches.filter((match) =>
    Boolean(predictions[match.id])
  );

  const availableMatchesWithoutPrediction = sortMatchesByDate(
    allMatches.filter(
      (match) =>
        match.status === 'Por jugar' &&
        isConfirmedMatch(match) &&
        !predictions[match.id]
    )
  );

  const matchesWithPrediction = sortMatchesByDate(
    predictedMatches.filter(isConfirmedMatch)
  );

  const predictionPoints = calculateTotalPredictionPoints(
    allMatches,
    predictions
  );
  const totalPoints = predictionPoints + manualPoints;
  const totalPredictions = predictedMatches.length;

  const visibleMatches =
    selectedFilter === 'pending'
      ? availableMatchesWithoutPrediction
      : matchesWithPrediction;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#111827"
            colors={['#111827']}
          />
        }
      >
        <ScreenHeader
          title="Predicciones"
          subtitle="Guarda tus marcadores y revisa los partidos que ya predijiste."
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalPoints}</Text>
            <Text style={styles.summaryLabel}>Puntos</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalPredictions}</Text>
            <Text style={styles.summaryLabel}>Predicciones</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {availableMatchesWithoutPrediction.length}
            </Text>
            <Text style={styles.summaryLabel}>Por hacer</Text>
          </View>
        </View>

        <View style={styles.rulesRow}>
          <Text style={styles.rulesTitle}>Reglas</Text>

          <Pressable
            style={({ pressed }) => [
              styles.infoButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={showScoringRules}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color="#111827"
            />
          </Pressable>
        </View>

        <View style={styles.filtersRow}>
          <Pressable
            style={({ pressed }) => [
              styles.filterButton,
              selectedFilter === 'pending' && styles.activeFilterButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setSelectedFilter('pending')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'pending' && styles.activeFilterButtonText,
              ]}
            >
              Por hacer
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.filterButton,
              selectedFilter === 'predicted' && styles.activeFilterButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setSelectedFilter('predicted')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilter === 'predicted' &&
                  styles.activeFilterButtonText,
              ]}
            >
              Con predicción
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'pending' ? 'Por hacer' : 'Con predicción'}
          </Text>
          <Text style={styles.sectionDescription}>
            {selectedFilter === 'pending'
              ? 'Partidos confirmados donde todavía puedes guardar una predicción.'
              : 'Partidos donde ya guardaste un marcador. Desliza hacia abajo para actualizar.'}
          </Text>
        </View>

        {visibleMatches.length > 0 ? (
          <View style={styles.matchesList}>
            {visibleMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                savedPrediction={getPrediction(match.id)}
                onPress={() => router.push(`/match/${match.id}` as never)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {getEmptyTitle({ isLoadingMatches, selectedFilter })}
            </Text>

            <Text style={styles.emptyText}>
              {getEmptyText({ isLoadingMatches, selectedFilter })}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#E5E7EB',
  },
  rulesRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rulesTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },
  infoButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  filterButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#6B7280',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  sectionDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  matchesList: {
    gap: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});