import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import {
  getFootballDataTodayAppMatches,
  getFootballDataTodayMatches,
  testFootballApiConnection,
  type FootballDataMatchSummary,
} from '@/services/footballApiService';
import type { Match } from '@/types/match';

export default function ApiStatusScreen() {
  const [statusMessage, setStatusMessage] = useState(
    'Presiona el botón para revisar la configuración.'
  );
  const [matches, setMatches] = useState<FootballDataMatchSummary[]>([]);
  const [appMatches, setAppMatches] = useState<Match[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingAppMatches, setIsLoadingAppMatches] = useState(false);

  async function handleCheckApi() {
    setIsChecking(true);

    const result = await testFootballApiConnection();
    setStatusMessage(result.message);

    setIsChecking(false);
  }

  async function handleLoadTodayMatches() {
    setIsLoadingMatches(true);

    try {
      const loadedMatches = await getFootballDataTodayMatches();
      setMatches(loadedMatches);

      setStatusMessage(
        `Partidos cargados desde Football-Data.org: ${loadedMatches.length}.`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los partidos.';

      setMatches([]);
      setStatusMessage(errorMessage);
    }

    setIsLoadingMatches(false);
  }

  async function handleLoadAppMatches() {
    setIsLoadingAppMatches(true);

    try {
      const loadedAppMatches = await getFootballDataTodayAppMatches();
      setAppMatches(loadedAppMatches);

      setStatusMessage(
        `Partidos convertidos al formato interno de la app: ${loadedAppMatches.length}.`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'No se pudieron convertir los partidos.';

      setAppMatches([]);
      setStatusMessage(errorMessage);
    }

    setIsLoadingAppMatches(false);
  }

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
          title="Estado de API"
          subtitle="Revisa si la configuración de Football-Data.org está lista."
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>API de fútbol</Text>

          <Text style={styles.cardText}>{statusMessage}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.checkButton,
              pressed && styles.buttonPressed,
              isChecking && styles.disabledButton,
            ]}
            onPress={handleCheckApi}
            disabled={isChecking}
          >
            <Text style={styles.checkButtonText}>
              {isChecking ? 'Revisando...' : 'Revisar configuración'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Partidos de hoy</Text>

          <Text style={styles.cardText}>
            Carga partidos reales usando el endpoint de Football-Data.org.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.checkButton,
              pressed && styles.buttonPressed,
              isLoadingMatches && styles.disabledButton,
            ]}
            onPress={handleLoadTodayMatches}
            disabled={isLoadingMatches}
          >
            <Text style={styles.checkButtonText}>
              {isLoadingMatches
                ? 'Cargando partidos...'
                : 'Cargar partidos de hoy'}
            </Text>
          </Pressable>

          {matches.length === 0 ? (
            <Text style={styles.noMatchesText}>
              Todavía no se cargaron partidos o no hay partidos disponibles para
              hoy.
            </Text>
          ) : (
            matches.slice(0, 10).map((match) => (
              <View key={match.id} style={styles.matchCard}>
                <Text style={styles.matchTitle}>
                  {match.homeTeam} vs {match.awayTeam}
                </Text>

                <Text style={styles.matchText}>{match.competitionName}</Text>
                <Text style={styles.matchText}>Inicio: {match.startingAt}</Text>
                <Text style={styles.matchText}>Estado: {match.status}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Formato interno de la app</Text>

          <Text style={styles.cardText}>
            Convierte los partidos reales al tipo Match para mostrarlos con el
            mismo diseño de tus tarjetas.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.checkButton,
              pressed && styles.buttonPressed,
              isLoadingAppMatches && styles.disabledButton,
            ]}
            onPress={handleLoadAppMatches}
            disabled={isLoadingAppMatches}
          >
            <Text style={styles.checkButtonText}>
              {isLoadingAppMatches
                ? 'Convirtiendo partidos...'
                : 'Probar MatchCard real'}
            </Text>
          </Pressable>

          {appMatches.length === 0 ? (
            <Text style={styles.noMatchesText}>
              Todavía no se cargaron partidos en formato interno.
            </Text>
          ) : (
            appMatches.slice(0, 5).map((match) => (
              <View key={match.id} style={styles.appMatchWrapper}>
                <MatchCard match={match} />
              </View>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Siguiente paso</Text>
          <Text style={styles.infoText}>
            Si estas tarjetas se ven bien, después conectaremos esta función a la
            pantalla principal de Partidos.
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
  card: {
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
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 14,
  },
  checkButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  matchCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  matchTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  matchText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  noMatchesText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  appMatchWrapper: {
    marginTop: 12,
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