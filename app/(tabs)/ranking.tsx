import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { matches } from '@/data/matches';
import { usePredictions } from '../../contexts/PredictionsContext';
import { calculatePredictionStats } from '../../utils/predictionStats';

export default function RankingScreen() {
  const { predictions } = usePredictions();

  const stats = calculatePredictionStats(matches, predictions);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Ranking"
        subtitle="Mira tu posición, puntos y estadísticas de tus predicciones."
      />

      <View style={styles.userCard}>
        <View style={styles.positionBox}>
          <Text style={styles.positionText}>#1</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>Tú</Text>
          <Text style={styles.userDescription}>
            Ranking local de prueba. Luego aquí aparecerán tus amigos.
          </Text>
        </View>

        <View style={styles.pointsBox}>
          <Text style={styles.pointsText}>{stats.totalPoints}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalPredictions}</Text>
          <Text style={styles.statLabel}>Predicciones</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingPredictions}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.finishedPredictions}</Text>
          <Text style={styles.statLabel}>Finalizadas</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.accuracy}%</Text>
          <Text style={styles.statLabel}>Efectividad</Text>
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Detalle de aciertos</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Resultados exactos</Text>
          <Text style={styles.detailValue}>{stats.exactHits}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ganador o empate acertado</Text>
          <Text style={styles.detailValue}>{stats.outcomeHits}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Predicciones falladas</Text>
          <Text style={styles.detailValue}>{stats.failedPredictions}</Text>
        </View>
      </View>

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Próximamente</Text>
        <Text style={styles.previewText}>
          Cuando agreguemos usuarios, grupos y amigos, esta pantalla mostrará un
          ranking real con varias personas compitiendo por puntos.
        </Text>

        <View style={styles.fakeRankingRow}>
          <Text style={styles.fakeRankingPosition}>#2</Text>
          <Text style={styles.fakeRankingName}>Amigo invitado</Text>
          <Text style={styles.fakeRankingPoints}>0 pts</Text>
        </View>

        <View style={styles.fakeRankingRow}>
          <Text style={styles.fakeRankingPosition}>#3</Text>
          <Text style={styles.fakeRankingName}>Otro jugador</Text>
          <Text style={styles.fakeRankingPoints}>0 pts</Text>
        </View>
      </View>
    </ScrollView>
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
    paddingBottom: 32,
  },
  userCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  positionBox: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  pointsBox: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D1D5DB',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47.8%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: '#6B7280',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
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
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 14,
  },
  fakeRankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fakeRankingPosition: {
    width: 42,
    fontSize: 15,
    fontWeight: '900',
    color: '#9CA3AF',
  },
  fakeRankingName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#6B7280',
  },
  fakeRankingPoints: {
    fontSize: 15,
    fontWeight: '900',
    color: '#9CA3AF',
  },
});