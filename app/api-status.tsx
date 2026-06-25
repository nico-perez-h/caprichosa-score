import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import {
  getSportMonksInplayMatchSummaries,
  testFootballApiConnection,
  type SportMonksLiveMatchSummary,
} from '@/services/footballApiService';

export default function ApiStatusScreen() {
  const [statusMessage, setStatusMessage] = useState(
    'Presiona el botón para revisar la configuración.'
  );
  const [liveMatches, setLiveMatches] = useState<SportMonksLiveMatchSummary[]>(
    []
  );
  const [isChecking, setIsChecking] = useState(false);

  async function handleCheckApi() {
    setIsChecking(true);

    const result = await testFootballApiConnection();

    setStatusMessage(result.message);

    if (result.ok) {
      const loadedLiveMatches = await getSportMonksInplayMatchSummaries();
      setLiveMatches(loadedLiveMatches);
    } else {
      setLiveMatches([]);
    }

    setIsChecking(false);
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
          subtitle="Revisa si la configuración de la API de fútbol está lista."
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
          <Text style={styles.cardTitle}>Partidos reales en vivo</Text>

          {liveMatches.length === 0 ? (
            <Text style={styles.cardText}>
              No hay partidos en vivo en este momento o el endpoint no devolvió
              partidos.
            </Text>
          ) : (
            liveMatches.map((match) => (
              <View key={match.id} style={styles.liveMatchCard}>
                <Text style={styles.liveMatchTitle}>
                  {match.homeTeam} vs {match.awayTeam}
                </Text>

                <Text style={styles.liveMatchText}>{match.leagueName}</Text>
                <Text style={styles.liveMatchText}>Estado: {match.status}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Siguiente paso</Text>
          <Text style={styles.infoText}>
            Después haremos una función para traer partidos por fecha o por liga
            y convertirlos al formato interno de la app.
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
  liveMatchCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  liveMatchTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  liveMatchText: {
    fontSize: 13,
    lineHeight: 18,
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