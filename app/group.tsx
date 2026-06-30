import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  getGroupAnnouncements,
  type GroupAnnouncement,
} from "@/services/groupAdjustmentsService";
import {
  deleteGroup,
  getCurrentGroupData,
  leaveGroup,
  removeGroupMemberFromGroup,
  updateGroupPredictionLockMinutes,
  type CurrentGroupData,
  type GroupMemberWithProfile,
} from "@/services/groupsService";

type LockOption = {
  label: string;
  description: string;
  value: number | null;
};

const lockOptions: LockOption[] = [
  {
    label: "Por defecto",
    description: "Se cierra cuando el partido ya no esté Por jugar.",
    value: null,
  },
  {
    label: "10 min antes",
    description: "Se cierra 10 minutos antes del partido.",
    value: 10,
  },
  {
    label: "30 min antes",
    description: "Se cierra 30 minutos antes del partido.",
    value: 30,
  },
  {
    label: "60 min antes",
    description: "Se cierra 1 hora antes del partido.",
    value: 60,
  },
];

function formatAnnouncementDate(dateText: string) {
  const date = new Date(dateText);

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/La_Paz",
  }).format(date);
}

function isSameLockValue(
  firstValue: number | null,
  secondValue: number | null,
) {
  return firstValue === secondValue;
}

export default function GroupScreen() {
  const { signOut } = useAuth();

  const [groupData, setGroupData] = useState<CurrentGroupData | null>(null);
  const [announcements, setAnnouncements] = useState<GroupAnnouncement[]>([]);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [isLeavingOrDeleting, setIsLeavingOrDeleting] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [isUpdatingLockMinutes, setIsUpdatingLockMinutes] = useState(false);

  async function loadGroup() {
    try {
      setIsLoadingGroup(true);

      const loadedGroupData = await getCurrentGroupData();

      setGroupData(loadedGroupData);

      if (loadedGroupData) {
        const loadedAnnouncements = await getGroupAnnouncements(
          loadedGroupData.group.id,
        );

        setAnnouncements(loadedAnnouncements);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo cargar el grupo.";

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoadingGroup(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadGroup();
    }, []),
  );

  async function handleCopyGroupCode() {
    if (!groupData) {
      return;
    }

    await Clipboard.setStringAsync(groupData.group.inviteCode);

    Alert.alert(
      "Código copiado",
      `El código ${groupData.group.inviteCode} fue copiado correctamente.`,
    );
  }

  async function handleUpdateLockMinutes(predictionLockMinutes: number | null) {
    if (!groupData) {
      return;
    }

    try {
      setIsUpdatingLockMinutes(true);

      const updatedGroup = await updateGroupPredictionLockMinutes({
        groupId: groupData.group.id,
        predictionLockMinutes,
      });

      setGroupData({
        ...groupData,
        group: updatedGroup,
      });

      Alert.alert(
        "Configuración guardada",
        "El cierre de predicciones fue actualizado.",
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la configuración.";

      Alert.alert("Error", errorMessage);
    } finally {
      setIsUpdatingLockMinutes(false);
    }
  }

  function handleLeaveGroup() {
    if (!groupData) {
      return;
    }

    Alert.alert(
      "Salir del grupo",
      `¿Seguro que quieres salir del grupo ${groupData.group.name}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLeavingOrDeleting(true);

              await leaveGroup(groupData.group.id);

              Alert.alert(
                "Saliste del grupo",
                "Ya no perteneces a este grupo.",
              );

              await loadGroup();
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "No se pudo salir del grupo.";

              Alert.alert("Error", errorMessage);
            } finally {
              setIsLeavingOrDeleting(false);
            }
          },
        },
      ],
    );
  }

  function handleDeleteGroup() {
    if (!groupData) {
      return;
    }

    Alert.alert(
      "Eliminar grupo",
      `¿Seguro que quieres eliminar el grupo ${groupData.group.name}? Esta acción eliminará integrantes, predicciones, ajustes y anuncios de este grupo.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLeavingOrDeleting(true);

              await deleteGroup(groupData.group.id);

              Alert.alert(
                "Grupo eliminado",
                "El grupo fue eliminado correctamente.",
              );

              setGroupData(null);
              setAnnouncements([]);

              router.replace("/group" as never);
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "No se pudo eliminar el grupo.";

              Alert.alert("Error", errorMessage);
            } finally {
              setIsLeavingOrDeleting(false);
            }
          },
        },
      ],
    );
  }

  function handleRemoveMember(member: GroupMemberWithProfile) {
    if (!groupData) {
      return;
    }

    Alert.alert(
      "Quitar integrante",
      `¿Seguro que quieres quitar a ${member.playerName} del grupo ${groupData.group.name}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Quitar",
          style: "destructive",
          onPress: async () => {
            try {
              setRemovingMemberId(member.userId);

              await removeGroupMemberFromGroup({
                groupId: groupData.group.id,
                targetUserId: member.userId,
              });

              Alert.alert(
                "Integrante quitado",
                `${member.playerName} ya no pertenece a este grupo.`,
              );

              await loadGroup();
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "No se pudo quitar al integrante.";

              Alert.alert("Error", errorMessage);
            } finally {
              setRemovingMemberId(null);
            }
          },
        },
      ],
    );
  }

  function handleSignOut() {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();

            router.replace("/auth/login" as never);
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "No se pudo cerrar sesión.";

            Alert.alert("Error", errorMessage);
          }
        },
      },
    ]);
  }

  if (isLoadingGroup) {
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title="Grupo de amigos"
            subtitle="Crea un grupo o únete con un código para entrar a la app."
          />

          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Todavía no tienes grupo</Text>
            <Text style={styles.emptyText}>
              Crea un grupo para competir con tus amigos o usa un código para
              unirte a uno existente.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push("/create-group" as never)}
            >
              <Text style={styles.primaryButtonText}>Crear grupo</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push("/join-group" as never)}
            >
              <Text style={styles.secondaryButtonText}>Unirse con código</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSignOut}
            >
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const isAdmin = groupData.role === "admin";

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)" as never)}
        >
          <Text style={styles.backButtonText}>← Volver a la app</Text>
        </Pressable>

        <ScreenHeader
          title="Grupo de amigos"
          subtitle="Compite con tus amigos dentro de un grupo privado."
        />

        <View style={styles.groupCard}>
          <Text style={styles.groupLabel}>
            {isAdmin ? "Administrador" : "Miembro"}
          </Text>
          <Text style={styles.groupName}>{groupData.group.name}</Text>

          {groupData.group.description ? (
            <Text style={styles.groupDescription}>
              {groupData.group.description}
            </Text>
          ) : null}

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Código del grupo</Text>
            <Text style={styles.codeText}>{groupData.group.inviteCode}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.copyButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCopyGroupCode}
          >
            <Text style={styles.copyButtonText}>Copiar código</Text>
          </Pressable>

          <View style={styles.groupActionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.groupActionButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push("/create-group" as never)}
            >
              <Text style={styles.groupActionButtonText}>Crear otro</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.groupActionButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push("/join-group" as never)}
            >
              <Text style={styles.groupActionButtonText}>Unirme a otro</Text>
            </Pressable>
          </View>

          {isAdmin ? (
            <Pressable
              style={({ pressed }) => [
                styles.adminPointsButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push("/admin-points" as never)}
            >
              <Text style={styles.adminPointsButtonText}>Ajustar puntos</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.myGroupsButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/my-groups" as never)}
          >
            <Text style={styles.myGroupsButtonText}>Ver mis grupos</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.enterAppButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.replace("/(tabs)" as never)}
          >
            <Text style={styles.enterAppButtonText}>Entrar a la app</Text>
          </Pressable>
        </View>

        {isAdmin ? (
          <View style={styles.lockConfigCard}>
            <Text style={styles.cardTitle}>Cierre de predicciones</Text>
            <Text style={styles.lockConfigText}>
              Define cuándo se bloquean las predicciones para este grupo.
            </Text>

            <View style={styles.lockOptionsList}>
              {lockOptions.map((option) => {
                const isSelected = isSameLockValue(
                  groupData.group.predictionLockMinutes,
                  option.value,
                );

                return (
                  <Pressable
                    key={option.label}
                    style={({ pressed }) => [
                      styles.lockOptionButton,
                      isSelected && styles.activeLockOptionButton,
                      pressed && styles.buttonPressed,
                      isUpdatingLockMinutes && styles.disabledButton,
                    ]}
                    onPress={() => handleUpdateLockMinutes(option.value)}
                    disabled={isUpdatingLockMinutes || isSelected}
                  >
                    <View style={styles.lockOptionTextBox}>
                      <Text
                        style={[
                          styles.lockOptionTitle,
                          isSelected && styles.activeLockOptionTitle,
                        ]}
                      >
                        {option.label}
                      </Text>

                      <Text
                        style={[
                          styles.lockOptionDescription,
                          isSelected && styles.activeLockOptionDescription,
                        ]}
                      >
                        {option.description}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.lockOptionCheck,
                        isSelected && styles.activeLockOptionCheck,
                      ]}
                    >
                      {isSelected ? "✓" : ""}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{groupData.members.length}</Text>
            <Text style={styles.statLabel}>Integrantes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Torneo activo</Text>
          </View>
        </View>

        <View style={styles.membersCard}>
          <Text style={styles.cardTitle}>Integrantes</Text>

          {groupData.members.map((member, index) => {
            const canRemoveMember = isAdmin && member.role === "member";
            const isRemovingThisMember = removingMemberId === member.userId;

            return (
              <View key={member.id} style={styles.memberRow}>
                <Text style={styles.memberPosition}>#{index + 1}</Text>

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.playerName}</Text>

                  <Text style={styles.memberMeta}>
                    {member.role === "admin" ? "Administrador" : "Miembro"}
                  </Text>
                </View>

                {canRemoveMember ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.removeMemberButton,
                      pressed && styles.buttonPressed,
                      isRemovingThisMember && styles.disabledButton,
                    ]}
                    onPress={() => handleRemoveMember(member)}
                    disabled={isRemovingThisMember}
                  >
                    <Text style={styles.removeMemberButtonText}>
                      {isRemovingThisMember ? "..." : "Quitar"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={styles.announcementsCard}>
          <Text style={styles.cardTitle}>Anuncios recientes</Text>

          {announcements.length === 0 ? (
            <View style={styles.emptyAnnouncementBox}>
              <Text style={styles.emptyAnnouncementTitle}>
                Sin anuncios todavía
              </Text>
              <Text style={styles.emptyAnnouncementText}>
                Cuando el administrador ajuste puntos o publique novedades,
                aparecerán aquí.
              </Text>
            </View>
          ) : (
            announcements.map((announcement) => (
              <View key={announcement.id} style={styles.announcementRow}>
                <View style={styles.announcementDot} />

                <View style={styles.announcementInfo}>
                  <Text style={styles.announcementTitle}>
                    {announcement.title}
                  </Text>

                  <Text style={styles.announcementDate}>
                    {formatAnnouncementDate(announcement.created_at)}
                  </Text>

                  <Text style={styles.announcementMessage}>
                    {announcement.message}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>
            {isAdmin ? "Eliminar grupo" : "Salir del grupo"}
          </Text>

          <Text style={styles.dangerText}>
            {isAdmin
              ? "Como administrador puedes eliminar este grupo completo. Esta acción no se puede deshacer."
              : "Puedes salir de este grupo. Si luego quieres volver, necesitarás el código de invitación."}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.dangerButton,
              pressed && styles.buttonPressed,
              isLeavingOrDeleting && styles.disabledButton,
            ]}
            onPress={isAdmin ? handleDeleteGroup : handleLeaveGroup}
            disabled={isLeavingOrDeleting}
          >
            <Text style={styles.dangerButtonText}>
              {isLeavingOrDeleting
                ? "Procesando..."
                : isAdmin
                  ? "Eliminar grupo"
                  : "Salir del grupo"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Grupo activo</Text>
          <Text style={styles.infoText}>
            Este grupo ya usa integrantes reales, predicciones, ranking y
            ajustes de puntos guardados en Supabase.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  groupCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#D1D5DB",
    marginBottom: 6,
  },
  groupName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  groupDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  codeBox: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 14,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6B7280",
    marginBottom: 4,
  },
  codeText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: 1,
  },
  copyButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  copyButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  groupActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  groupActionButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  groupActionButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  adminPointsButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  adminPointsButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  enterAppButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  enterAppButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  myGroupsButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  myGroupsButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  lockConfigCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  lockConfigText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  lockOptionsList: {
    gap: 10,
  },
  lockOptionButton: {
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activeLockOptionButton: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  lockOptionTextBox: {
    flex: 1,
  },
  lockOptionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  activeLockOptionTitle: {
    color: "#FFFFFF",
  },
  lockOptionDescription: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "#6B7280",
  },
  activeLockOptionDescription: {
    color: "#D1D5DB",
  },
  lockOptionCheck: {
    width: 24,
    fontSize: 18,
    fontWeight: "900",
    color: "#9CA3AF",
    textAlign: "center",
  },
  activeLockOptionCheck: {
    color: "#FFFFFF",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 16,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  logoutButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#991B1B",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  statLabel: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#6B7280",
  },
  membersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  memberPosition: {
    width: 38,
    fontSize: 15,
    fontWeight: "900",
    color: "#9CA3AF",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  memberMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  removeMemberButton: {
    minWidth: 72,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  removeMemberButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#991B1B",
  },
  announcementsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  announcementRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  announcementDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#111827",
    marginTop: 5,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  announcementDate: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800",
    color: "#9CA3AF",
  },
  announcementMessage: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptyAnnouncementBox: {
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    padding: 14,
  },
  emptyAnnouncementTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  emptyAnnouncementText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#6B7280",
  },
  dangerCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
  },
  dangerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#991B1B",
    marginBottom: 6,
  },
  dangerText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#7F1D1D",
    marginBottom: 12,
  },
  dangerButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#991B1B",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1D4ED8",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#1E40AF",
  },
});
