import { StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { matches } from '@/data/matches';
import { usePredictions } from '../../contexts/PredictionsContext';
import { calculateTotalPredictionPoints } from '../../utils/scoring';

export default function RankingScreen() {
  const { predictions } = usePredictions();

  const totalPoints = calculateTotalPredictionPoints(matches, predictions);
  const totalPredictions = Object.keys(predictions).length;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Ranking"
        subtitle="Aquí verás quién tiene más puntos en tus grupos."
      />

      <View style={styles.leaderCard}>
        <Text style={styles.leaderBadge}>#1</Text>

        <View style={styles.leaderInfo}>
          <Text style={styles.leaderName}>Tú</Text>
          <Text style={styles.leaderSubtitle}>
            {totalPredictions} predicciones guardadas
          </Text>
        </View>

        <View style={styles.pointsBox}>
          <Text style={styles.pointsNumber}>{totalPoints}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Ranking local</Text>
        <Text style={styles.infoText}>
          Por ahora el ranking muestra solo tus puntos. Más adelante, cuando conectemos usuarios y grupos, aquí aparecerán tus amigos y sus posiciones.
        </Text>
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Próximamente</Text>

        <View style={styles.previewRow}>
          <Text style={styles.previewPosition}>#2</Text>
          <Text style={styles.previewName}>Amigo invitado</Text>
          <Text style={styles.previewPoints}>0 pts</Text>
        </View>

        <View style={styles.previewRow}>
          <Text style={styles.previewPosition}>#3</Text>
          <Text style={styles.previewName}>Amigo invitado</Text>
          <Text style={styles.previewPoints}>0 pts</Text>
        </View>
      </View>
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
  leaderCard: {
    backgroundColor: '#111827',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  leaderBadge: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 46,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  leaderSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#D1D5DB',
  },
  pointsBox: {
    alignItems: 'center',
  },
  pointsNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pointsLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D1D5DB',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 14,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  previewPosition: {
    width: 34,
    fontSize: 14,
    fontWeight: '900',
    color: '#6B7280',
  },
  previewName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  previewPoints: {
    fontSize: 14,
    fontWeight: '900',
    color: '#9CA3AF',
  },
});