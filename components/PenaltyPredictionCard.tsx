import { Pressable, StyleSheet, Text, View } from "react-native";

type PenaltyPredictionCardProps = {
  homeTeam: string;
  awayTeam: string;
  homePenaltyScore: number;
  awayPenaltyScore: number;
  isPredictionLocked: boolean;
  hasSavedPenaltyPrediction: boolean;
  onDecreaseHomePenaltyScore: () => void;
  onIncreaseHomePenaltyScore: () => void;
  onDecreaseAwayPenaltyScore: () => void;
  onIncreaseAwayPenaltyScore: () => void;
  onSavePenaltyPrediction: () => void;
  onDeletePenaltyPrediction: () => void;
};

export function PenaltyPredictionCard({
  homeTeam,
  awayTeam,
  homePenaltyScore,
  awayPenaltyScore,
  isPredictionLocked,
  hasSavedPenaltyPrediction,
  onDecreaseHomePenaltyScore,
  onIncreaseHomePenaltyScore,
  onDecreaseAwayPenaltyScore,
  onIncreaseAwayPenaltyScore,
  onSavePenaltyPrediction,
  onDeletePenaltyPrediction,
}: PenaltyPredictionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerBox}>
        <Text style={styles.kicker}>Eliminatoria</Text>
        <Text style={styles.title}>Predicción por penales</Text>
        <Text style={styles.subtitle}>
          Como pronosticaste empate en los 120 minutos, también puedes predecir
          la tanda de penales.
        </Text>
      </View>

      <View style={styles.scoreBox}>
        <View style={styles.teamColumn}>
          <Text style={styles.teamName} numberOfLines={2}>
            {homeTeam}
          </Text>

          <View style={styles.counterRow}>
            <Pressable
              style={({ pressed }) => [
                styles.counterButton,
                pressed && styles.buttonPressed,
                isPredictionLocked && styles.disabledButton,
              ]}
              onPress={onDecreaseHomePenaltyScore}
              disabled={isPredictionLocked}
            >
              <Text style={styles.counterButtonText}>−</Text>
            </Pressable>

            <Text style={styles.scoreText}>{homePenaltyScore}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.counterButton,
                pressed && styles.buttonPressed,
                isPredictionLocked && styles.disabledButton,
              ]}
              onPress={onIncreaseHomePenaltyScore}
              disabled={isPredictionLocked}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.separator}>-</Text>

        <View style={styles.teamColumn}>
          <Text style={styles.teamName} numberOfLines={2}>
            {awayTeam}
          </Text>

          <View style={styles.counterRow}>
            <Pressable
              style={({ pressed }) => [
                styles.counterButton,
                pressed && styles.buttonPressed,
                isPredictionLocked && styles.disabledButton,
              ]}
              onPress={onDecreaseAwayPenaltyScore}
              disabled={isPredictionLocked}
            >
              <Text style={styles.counterButtonText}>−</Text>
            </Pressable>

            <Text style={styles.scoreText}>{awayPenaltyScore}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.counterButton,
                pressed && styles.buttonPressed,
                isPredictionLocked && styles.disabledButton,
              ]}
              onPress={onIncreaseAwayPenaltyScore}
              disabled={isPredictionLocked}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.actionsBox}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.buttonPressed,
            isPredictionLocked && styles.disabledButton,
          ]}
          onPress={onSavePenaltyPrediction}
          disabled={isPredictionLocked}
        >
          <Text style={styles.saveButtonText}>
            {hasSavedPenaltyPrediction
              ? "Actualizar penales"
              : "Guardar penales"}
          </Text>
        </Pressable>

        {hasSavedPenaltyPrediction ? (
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.buttonPressed,
              isPredictionLocked && styles.disabledButton,
            ]}
            onPress={onDeletePenaltyPrediction}
            disabled={isPredictionLocked}
          >
            <Text style={styles.deleteButtonText}>Eliminar penales</Text>
          </Pressable>
        ) : null}
      </View>

      {isPredictionLocked ? (
        <View style={styles.lockedBox}>
          <Text style={styles.lockedText}>
            La predicción por penales también está cerrada.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#EEF2FF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginBottom: 16,
  },
  headerBox: {
    marginBottom: 16,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "900",
    color: "#4338CA",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#312E81",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#4338CA",
  },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },
  teamColumn: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  teamName: {
    minHeight: 38,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    color: "#312E81",
    textAlign: "center",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  counterButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#312E81",
  },
  scoreText: {
    minWidth: 34,
    fontSize: 28,
    fontWeight: "900",
    color: "#312E81",
    textAlign: "center",
  },
  separator: {
    fontSize: 24,
    fontWeight: "900",
    color: "#818CF8",
    marginTop: 36,
  },
  actionsBox: {
    gap: 10,
  },
  saveButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: "#312E81",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  deleteButton: {
    height: 48,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#312E81",
  },
  lockedBox: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#E0E7FF",
    padding: 12,
  },
  lockedText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#3730A3",
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  disabledButton: {
    opacity: 0.5,
  },
});