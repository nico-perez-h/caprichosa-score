import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/contexts/AuthContext';
import { createPointAdjustment } from '@/services/groupAdjustmentsService';
import {
  getCurrentGroupData,
  type CurrentGroupData,
  type GroupMemberWithProfile,
} from '@/services/groupsService';

export default function AdminPointsScreen() {
  const { user } = useAuth();

  const [groupData, setGroupData] = useState<CurrentGroupData | null>(null);
  const [selectedMember, setSelectedMember] =
    useState<GroupMemberWithProfile | null>(null);
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadGroupData() {
    try {
      setIsLoading(true);

      const loadedGroupData = await getCurrentGroupData();

      setGroupData(loadedGroupData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'No se pudo cargar el grupo.';

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadGroupData();
    }, [])
  );

  function decreasePoints() {
    setPoints((currentPoints) => currentPoints - 1);
  }

  function increasePoints() {
    setPoints((currentPoints) => currentPoints + 1);
  }

  async function handleSaveAdjustment() {
    if (!user || !groupData) {
      Alert.alert('Error', 'No se pudo identificar tu usuario o grupo.');
      return;
    }

    if (groupData.role !== 'admin') {
      Alert.alert(
        'Sin permiso',
        'Solo el administrador del grupo puede ajustar puntos.'
      );
      return;
    }

    if (!selectedMember) {
      Alert.alert('Selecciona un integrante', 'Elige a quién ajustar puntos.');
      return;
    }

    if (points === 0) {
      Alert.alert(
        'Sin cambios',
        'Usa + o - para sumar o quitar puntos antes de guardar.'
      );
      return;
    }

    const actionText = points > 0 ? 'sumar' : 'quitar';
    const absolutePoints = Math.abs(points);
    const pointsLabel = absolutePoints === 1 ? 'punto' : 'puntos';

    try {
      setIsSaving(true);

      await createPointAdjustment({
        groupId: groupData.group.id,
        adminUserId: user.id,
        targetUserId: selectedMember.userId,
        targetPlayerName: selectedMember.playerName,
        points,
        reason:
          points > 0
            ? 'Ajuste positivo del administrador'
            : 'Ajuste negativo del administrador',
      });

      Alert.alert(
        'Puntos ajustados',
        `Se acaba de ${actionText} ${absolutePoints} ${pointsLabel} a ${selectedMember.playerName}.`,
        [
          {
            text: 'Ver ranking',
            onPress: () => router.replace('/(tabs)/ranking' as never),
          },
          {
            text: 'Volver al grupo',
            onPress: () => router.replace('/group' as never),
          },
        ]
      );

      setSelectedMember(null);
      setPoints(0);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'No se pudo guardar el ajuste.';

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContent}>
          <ActivityIndicator color="#111827" />
          <Text style={styles.loadingText}>Cargando grupo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!groupData) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContent}>
          <Text style={styles.emptyTitle}>No hay grupo activo</Text>
          <Text style={styles.emptyText}>
            Selecciona un grupo para ajustar puntos.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (groupData.role !== 'admin') {
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
            title="Ajustar puntos"
            subtitle="Esta opción es solo para administradores."
          />

          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin permiso</Text>
            <Text style={styles.emptyText}>
              Solo el administrador de este grupo puede sumar o quitar puntos.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const absolutePoints = Math.abs(points);
  const adjustmentText =
    points > 0
      ? `Sumar ${absolutePoints} ${absolutePoints === 1 ? 'punto' : 'puntos'}`
      : points < 0
        ? `Quitar ${absolutePoints} ${absolutePoints === 1 ? 'punto' : 'puntos'}`
        : 'Sin ajuste';

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
          title="Ajustar puntos"
          subtitle={`Administra puntos manuales en ${groupData.group.name}.`}
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selecciona integrante</Text>

          {groupData.members.map((member) => {
            const isSelected = selectedMember?.userId === member.userId;

            return (
              <Pressable
                key={member.id}
                style={({ pressed }) => [
                  styles.memberButton,
                  isSelected && styles.selectedMemberButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setSelectedMember(member)}
              >
                <View style={styles.memberInfo}>
                  <Text
                    style={[
                      styles.memberName,
                      isSelected && styles.selectedMemberText,
                    ]}
                  >
                    {member.playerName}
                  </Text>

                  <Text
                    style={[
                      styles.memberRole,
                      isSelected && styles.selectedMemberMetaText,
                    ]}
                  >
                    {member.role === 'admin' ? 'Administrador' : 'Miembro'}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.memberSelectText,
                    isSelected && styles.selectedMemberText,
                  ]}
                >
                  {isSelected ? 'Elegido' : 'Elegir'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Puntos</Text>

          <View style={styles.pointsSelector}>
            <Pressable
              style={({ pressed }) => [
                styles.pointsButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={decreasePoints}
              disabled={isSaving}
            >
              <MaterialCommunityIcons name="minus" size={28} color="#111827" />
            </Pressable>

            <View style={styles.pointsDisplay}>
              <Text
                style={[
                  styles.pointsValue,
                  points > 0 && styles.positivePoints,
                  points < 0 && styles.negativePoints,
                ]}
              >
                {points > 0 ? `+${points}` : points}
              </Text>
              <Text style={styles.pointsLabel}>puntos</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.pointsButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={increasePoints}
              disabled={isSaving}
            >
              <MaterialCommunityIcons name="plus" size={28} color="#111827" />
            </Pressable>
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Mensaje automático</Text>
            <Text style={styles.previewText}>
              {selectedMember
                ? points === 0
                  ? `No se ajustarán puntos a ${selectedMember.playerName}.`
                  : `El administrador ${
                      points > 0 ? 'sumará' : 'quitará'
                    } ${absolutePoints} ${
                      absolutePoints === 1 ? 'punto' : 'puntos'
                    } a ${selectedMember.playerName}.`
                : 'Selecciona un integrante para ver el mensaje.'}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.buttonPressed,
              (isSaving || points === 0 || !selectedMember) &&
                styles.disabledButton,
            ]}
            onPress={handleSaveAdjustment}
            disabled={isSaving || points === 0 || !selectedMember}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Guardando...' : adjustmentText}
            </Text>
          </Pressable>

          <Text style={styles.helperText}>
            Usa + para sumar puntos y - para quitar puntos.
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
  loadingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
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
    marginBottom: 12,
  },
  memberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  selectedMemberButton: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  memberRole: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  memberSelectText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  selectedMemberText: {
    color: '#FFFFFF',
  },
  selectedMemberMetaText: {
    color: '#D1D5DB',
  },
  pointsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 16,
  },
  pointsButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pointsDisplay: {
    flex: 1,
    minHeight: 90,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  positivePoints: {
    color: '#FFFFFF',
  },
  negativePoints: {
    color: '#FFFFFF',
  },
  pointsLabel: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800',
    color: '#D1D5DB',
  },
  previewBox: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 14,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B7280',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#111827',
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.55,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  helperText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#6B7280',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
});