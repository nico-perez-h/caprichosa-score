import { StyleSheet, Text, View } from 'react-native';

export function ScoringRulesCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Reglas de puntuación</Text>

      <View style={styles.ruleRow}>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsText}>3 pts</Text>
        </View>

        <View style={styles.ruleTextBox}>
          <Text style={styles.ruleTitle}>Resultado exacto</Text>
          <Text style={styles.ruleDescription}>
            Acertaste los goles exactos de ambos equipos.
          </Text>
        </View>
      </View>

      <View style={styles.ruleRow}>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsText}>1 pt</Text>
        </View>

        <View style={styles.ruleTextBox}>
          <Text style={styles.ruleTitle}>Acertar ganador o empate</Text>
          <Text style={styles.ruleDescription}>
            Acertaste si gana el local, gana el visitante o si el partido termina empatado.
          </Text>
        </View>
      </View>

      <View style={styles.ruleRow}>
        <View style={styles.pointsBox}>
          <Text style={styles.pointsText}>0 pts</Text>
        </View>

        <View style={styles.ruleTextBox}>
          <Text style={styles.ruleTitle}>No acertaste</Text>
          <Text style={styles.ruleDescription}>
            Predijiste un ganador o empate diferente al resultado real.
          </Text>
        </View>
      </View>

      <Text style={styles.footerText}>
        Ejemplo: si el resultado real es 2 - 1, una predicción 1 - 0 suma 1 punto,
        pero una predicción 1 - 1 suma 0 puntos porque predijiste empate.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 16,
  },
  ruleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  pointsBox: {
    width: 54,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  ruleTextBox: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  ruleDescription: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  footerText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },
});