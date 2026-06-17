import { Pressable, StyleSheet, Text, View } from 'react-native';

export type SavedPrediction = {
  homeScore: number;
  awayScore: number;
};

type PredictionCardProps = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  savedPrediction: SavedPrediction | null;
  onDecreaseHomeScore: () => void;
  onIncreaseHomeScore: () => void;
  onDecreaseAwayScore: () => void;
  onIncreaseAwayScore: () => void;
  onSavePrediction: () => void;
};

export function PredictionCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  savedPrediction,
  onDecreaseHomeScore,
  onIncreaseHomeScore,
  onDecreaseAwayScore,
  onIncreaseAwayScore,
  onSavePrediction,
}: PredictionCardProps) {
  return (
    <View style={styles.predictionCard}>
      <Text style={styles.predictionTitle}>Tu predicción</Text>
      <Text style={styles.predictionText}>
        Elige cuántos goles crees que hará cada equipo.
      </Text>

      <View style={styles.scoreSelector}>
        <View style={styles.scoreColumn}>
          <Text style={styles.scoreTeam}>{homeTeam}</Text>

          <View style={styles.scoreControls}>
            <Pressable style={styles.scoreButton} onPress={onDecreaseHomeScore}>
              <Text style={styles.scoreButtonText}>−</Text>
            </Pressable>

            <Text style={styles.scoreNumber}>{homeScore}</Text>

            <Pressable style={styles.scoreButton} onPress={onIncreaseHomeScore}>
              <Text style={styles.scoreButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.scoreSeparator}>-</Text>

        <View style={styles.scoreColumn}>
          <Text style={styles.scoreTeam}>{awayTeam}</Text>

          <View style={styles.scoreControls}>
            <Pressable style={styles.scoreButton} onPress={onDecreaseAwayScore}>
              <Text style={styles.scoreButtonText}>−</Text>
            </Pressable>

            <Text style={styles.scoreNumber}>{awayScore}</Text>

            <Pressable style={styles.scoreButton} onPress={onIncreaseAwayScore}>
              <Text style={styles.scoreButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={onSavePrediction}>
        <Text style={styles.primaryButtonText}>
          {savedPrediction ? 'Actualizar predicción' : 'Guardar predicción'}
        </Text>
      </Pressable>

      {savedPrediction ? (
        <View style={styles.savedPredictionBox}>
          <Text style={styles.savedPredictionTitle}>Predicción guardada</Text>

          <Text style={styles.savedPredictionScore}>
            {homeTeam} {savedPrediction.homeScore} - {savedPrediction.awayScore}{' '}
            {awayTeam}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
});