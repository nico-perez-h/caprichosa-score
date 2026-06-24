import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { matches } from '@/data/matches';
import { usePredictions } from '../contexts/PredictionsContext';
import { calculatePredictionStats } from '../utils/predictionStats';

export default function ProfileScreen() {
  const { predictions } = usePredictions();
  const stats = calculatePredictionStats(matches, predictions);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <ScreenHeader
          title="Perfil"
          subtitle="Aquí verás tu información, estadísticas y configuración de la cuenta."
        />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>Tú</Text>
          </View>

          <Text style={styles.userName}>Jugador local</Text>
          <Text style={styles.userDescription}>
            Perfil de prueba para el desarrollo de Caprichosa Score.
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Tus estadísticas</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Puntos totales</Text>
            <Text style={styles.statValue}>{stats.totalPoints}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Predicciones hechas</Text>
            <Text style={styles.statValue}>{stats.totalPredictions}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Predicciones pendientes</Text>
            <Text style={styles.statValue}>{stats.pendingPredictions}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Efectividad</Text>
            <Text style={styles.statValue}>{stats.accuracy}%</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Configuración futura</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Nombre de usuario</Text>
            <Text style={styles.settingDescription}>
              Luego podrás cambiar cómo apareces en el ranking.
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Grupo de amigos</Text>
            <Text style={styles.settingDescription}>
              Aquí se mostrarán los grupos donde compites con otras personas.
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Cuenta</Text>
            <Text style={styles.settingDescription}>
              Más adelante agregaremos inicio de sesión, cerrar sesión y datos de cuenta.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Versión de prueba</Text>
          <Text style={styles.infoText}>
            Esta pantalla todavía usa datos locales. Cuando conectemos Supabase,
            aquí podremos mostrar el nombre real del usuario, su email, grupos,
            amigos y estadísticas guardadas en la nube.
          </Text>
        </View>
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  profileCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  userDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#D1D5DB',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 14,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#6B7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  settingItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  settingDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1D4ED8',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#1E40AF',
  },
});