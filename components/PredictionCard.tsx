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
  isPredictionLocked?: boolean;
  onDecreaseHomeScore: () => void;
  onIncreaseHomeScore: () => void;
  onDecreaseAwayScore: () => void;
  onIncreaseAwayScore: () => void;
  onSavePrediction: () => void;
  onDeletePrediction: () => void;
};

export function PredictionCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  savedPrediction,
  isPredictionLocked = false,
  onDecreaseHomeScore,
  onIncreaseHomeScore,
  onDecreaseAwayScore,
  onIncreaseAwayScore,
  onSavePrediction,
  onDeletePrediction,
}: PredictionCardProps) {
  return (
    <View style={styles.predictionCard}>
      <Text style={styles.predictionTitle}>Tu predicción</Text>

      {isPredictionLocked ? (
        <Text style={styles.lockedText}>
          Las predicciones para este partido ya están cerradas.
        </Text>
      ) : (
        <Text style={styles.predictionText}>
          Elige cuántos goles crees que hará cada equipo.
        </Text>
      )}

      <View style={styles.scoreSelector}>
        <View style={styles.scoreColumn}>
          <Text style={styles.scoreTeam}>{homeTeam}</Text>

          <View style={styles.scoreControls}>
            <Pressable
              disabled={isPredictionLocked}
              style={[
                styles.scoreButton,
                isPredictionLocked && styles.disabledButton,
              ]}
              onPress={onDecreaseHomeScore}
            >
              <Text
                style={[
                  styles.scoreButtonText,
                  isPredictionLocked && styles.disabledButtonText,
                ]}
              >
                −
              </Text>
            </Pressable>

            <Text style={styles.scoreNumber}>{homeScore}</Text>

            <Pressable
              disabled={isPredictionLocked}
              style={[
                styles.scoreButton,
                isPredictionLocked && styles.disabledButton,
              ]}
              onPress={onIncreaseHomeScore}
            >
              <Text
                style={[
                  styles.scoreButtonText,
                  isPredictionLocked && styles.disabledButtonText,
                ]}
              >
                +
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.scoreSeparator}>-</Text>

        <View style={styles.scoreColumn}>
          <Text style={styles.scoreTeam}>{awayTeam}</Text>

          <View style={styles.scoreControls}>
            <Pressable
              disabled={isPredictionLocked}
              style={[
                styles.scoreButton,
                isPredictionLocked && styles.disabledButton,
              ]}
              onPress={onDecreaseAwayScore}
            >
              <Text
                style={[
                  styles.scoreButtonText,
                  isPredictionLocked && styles.disabledButtonText,
                ]}
              >
                −
              </Text>
            </Pressable>

            <Text style={styles.scoreNumber}>{awayScore}</Text>

            <Pressable
              disabled={isPredictionLocked}
              style={[
                styles.scoreButton,
                isPredictionLocked && styles.disabledButton,
              ]}
              onPress={onIncreaseAwayScore}
            >
              <Text
                style={[
                  styles.scoreButtonText,
                  isPredictionLocked && styles.disabledButtonText,
                ]}
              >
                +
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable
        disabled={isPredictionLocked}
        style={[
          styles.primaryButton,
          isPredictionLocked && styles.primaryButtonDisabled,
        ]}
        onPress={onSavePrediction}
      >
        <Text
          style={[
            styles.primaryButtonText,
            isPredictionLocked && styles.primaryButtonTextDisabled,
          ]}
        >
          {isPredictionLocked
            ? 'Predicciones cerradas'
            : savedPrediction
              ? 'Actualizar predicción'
              : 'Guardar predicción'}
        </Text>
      </Pressable>

      {savedPrediction ? (
        <>
          <View style={styles.savedPredictionBox}>
            <Text style={styles.savedPredictionTitle}>Predicción guardada</Text>

            <Text style={styles.savedPredictionScore}>
              {homeTeam} {savedPrediction.homeScore} -{' '}
              {savedPrediction.awayScore} {awayTeam}
            </Text>
          </View>

          {!isPredictionLocked ? (
            <Pressable style={styles.deleteButton} onPress={onDeletePrediction}>
              <Text style={styles.deleteButtonText}>Eliminar predicción</Text>
            </Pressable>
          ) : null}
        </>
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
  lockedText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#991B1B',
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
  disabledButton: {
    backgroundColor: '#F9FAFB',
  },
  scoreButtonText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  disabledButtonText: {
    color: '#D1D5DB',
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
  primaryButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButtonTextDisabled: {
    color: '#9CA3AF',
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
  deleteButton: {
    marginTop: 12,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#991B1B',
  },
});