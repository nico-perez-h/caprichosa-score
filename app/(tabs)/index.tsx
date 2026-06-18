import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { matches } from '@/data/matches';
import { tournaments } from '@/data/tournaments';
import { usePredictions } from '../../contexts/PredictionsContext';

export default function HomeScreen() {
  const { predictions } = usePredictions();

  const totalMatches = matches.length;
  const totalPredictions = Object.keys(predictions).length;
  const activeTournaments = tournaments.filter(
    (tournament) => tournament.status === 'Disponible'
  ).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.logo}>⚽</Text>

        <ScreenHeader
          title="Caprichosa Score"
          subtitle="Predice partidos, compite con tus amigos y sigue tus resultados."
        />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalMatches}</Text>
          <Text style={styles.statLabel}>Partidos disponibles</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalPredictions}</Text>
          <Text style={styles.statLabel}>Predicciones guardadas</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeTournaments}</Text>
          <Text style={styles.statLabel}>Torneos activos</Text>
        </View>
      </View>

      <View style={styles.nextCard}>
        <Text style={styles.nextTitle}>Próximo paso</Text>
        <Text style={styles.nextText}>
          Entra a un partido, elige el resultado que crees que pasará y guarda tu predicción.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/matches' as never)}
        >
          <Text style={styles.primaryButtonText}>Ver partidos</Text>
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/tournaments' as never)}
        >
          <Text style={styles.secondaryButtonText}>Torneos</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/predictions' as never)}
        >
          <Text style={styles.secondaryButtonText}>Mis predicciones</Text>
        </Pressable>
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
  hero: {
    marginBottom: 4,
  },
  logo: {
    fontSize: 52,
    marginBottom: 14,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  nextCard: {
    backgroundColor: '#111827',
    borderRadius: 22,
    padding: 20,
    marginBottom: 14,
  },
  nextTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nextText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#D1D5DB',
  },
  primaryButton: {
    marginTop: 18,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
});