import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { matches } from '@/data/matches';
import { usePredictions } from '../../contexts/PredictionsContext';

export default function PredictionsScreen() {
  const { getPrediction } = usePredictions();

  const predictedMatches = matches.filter((match) => getPrediction(match.id));

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Mis predicciones"
        subtitle="Aquí verás los partidos donde ya guardaste una predicción."
      />

      <FlatList
        data={predictedMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            savedPrediction={getPrediction(item.id)}
            onPress={() => router.push(`/match/${item.id}` as never)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Todavía no tienes predicciones</Text>
            <Text style={styles.emptyText}>
              Entra a un partido, elige un resultado y guárdalo. Luego aparecerá aquí.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
});