import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { mockGroup } from '@/data/mockGroup';

export default function JoinGroupScreen() {
  const [groupCode, setGroupCode] = useState('');

  function handleJoinGroup() {
    const cleanCode = groupCode.trim().toUpperCase();

    if (!cleanCode) {
      Alert.alert('Código requerido', 'Escribe un código de grupo para continuar.');
      return;
    }

    if (cleanCode !== mockGroup.inviteCode) {
      Alert.alert(
        'Código inválido',
        'Ese código no existe en esta versión de prueba.'
      );
      return;
    }

    Alert.alert(
      'Grupo encontrado',
      `Te uniste al grupo ${mockGroup.name} correctamente.`,
      [
        {
          text: 'Ver grupo',
          onPress: () => router.replace('/group' as never),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <ScreenHeader
          title="Unirse a grupo"
          subtitle="Escribe el código que te compartió un amigo."
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Código de invitación</Text>

          <TextInput
            value={groupCode}
            onChangeText={setGroupCode}
            placeholder={`Ej: ${mockGroup.inviteCode}`}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            style={styles.input}
          />

          <Pressable
            style={({ pressed }) => [
              styles.joinButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleJoinGroup}
          >
            <Text style={styles.joinButtonText}>Unirme al grupo</Text>
          </Pressable>

          <Text style={styles.helperText}>
            Para probar, usa el código {mockGroup.inviteCode}.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Versión de prueba</Text>
          <Text style={styles.infoText}>
            Más adelante este código se validará contra Supabase para unirte a
            grupos reales.
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
    marginBottom: 14,
  },
  input: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  joinButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  helperText: {
    marginTop: 12,
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