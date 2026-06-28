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
import {
  getMyGroups,
  setActiveGroup,
  type MyGroupItem,
} from '@/services/groupsService';

export default function MyGroupsScreen() {
  const [groups, setGroups] = useState<MyGroupItem[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  async function loadGroups() {
    try {
      setIsLoadingGroups(true);

      const loadedGroups = await getMyGroups();

      setGroups(loadedGroups);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'No se pudieron cargar tus grupos.';

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoadingGroups(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  async function handleSelectGroup(groupId: string) {
    try {
      setSelectedGroupId(groupId);

      const activeGroup = await setActiveGroup(groupId);

      Alert.alert(
        'Grupo activo',
        `Ahora estás jugando en "${activeGroup.name}".`,
        [
          {
            text: 'Ver grupo',
            onPress: () => router.replace('/group' as never),
          },
          {
            text: 'Ir al inicio',
            onPress: () => router.replace('/(tabs)' as never),
          },
        ]
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'No se pudo cambiar de grupo.';

      Alert.alert('Error', errorMessage);
    } finally {
      setSelectedGroupId(null);
    }
  }

  if (isLoadingGroups) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContent}>
          <ActivityIndicator color="#111827" />
          <Text style={styles.loadingText}>Cargando tus grupos...</Text>
        </View>
      </SafeAreaView>
    );
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
          title="Mis grupos"
          subtitle="Elige en qué grupo quieres jugar."
        />

        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Agregar grupo</Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/create-group' as never)}
          >
            <Text style={styles.primaryButtonText}>Crear grupo</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/join-group' as never)}
          >
            <Text style={styles.secondaryButtonText}>Unirme con código</Text>
          </Pressable>
        </View>

        <View style={styles.groupsCard}>
          <Text style={styles.cardTitle}>Tus grupos</Text>

          {groups.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No tienes grupos todavía</Text>
              <Text style={styles.emptyText}>
                Crea un grupo o únete con un código para empezar a jugar.
              </Text>
            </View>
          ) : (
            groups.map((item) => {
              const isSelecting = selectedGroupId === item.group.id;

              return (
                <Pressable
                  key={item.group.id}
                  style={({ pressed }) => [
                    styles.groupItem,
                    item.isActive && styles.activeGroupItem,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => handleSelectGroup(item.group.id)}
                  disabled={isSelecting}
                >
                  <View style={styles.groupInfo}>
                    <Text
                      style={[
                        styles.groupName,
                        item.isActive && styles.activeGroupText,
                      ]}
                    >
                      {item.group.name}
                    </Text>

                    <Text
                      style={[
                        styles.groupMeta,
                        item.isActive && styles.activeGroupMetaText,
                      ]}
                    >
                      {item.role === 'admin' ? 'Administrador' : 'Miembro'} ·{' '}
                      {item.group.inviteCode}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      item.isActive && styles.activeStatusPill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        item.isActive && styles.activeStatusPillText,
                      ]}
                    >
                      {item.isActive
                        ? 'Activo'
                        : isSelecting
                          ? 'Cambiando...'
                          : 'Usar'}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Grupo activo</Text>
          <Text style={styles.infoText}>
            El grupo activo es donde se mostrarán tus puntos, ranking y
            predicciones dentro de la app.
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
  actionsCard: {
    backgroundColor: '#111827',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  primaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  secondaryButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  groupsCard: {
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
  groupItem: {
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
  activeGroupItem: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  activeGroupText: {
    color: '#FFFFFF',
  },
  groupMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeGroupMetaText: {
    color: '#D1D5DB',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#E5E7EB',
  },
  activeStatusPill: {
    backgroundColor: '#FFFFFF',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
  activeStatusPillText: {
    color: '#111827',
  },
  emptyBox: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  emptyText: {
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