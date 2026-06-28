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
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { ScreenHeader } from "@/components/ScreenHeader";
import {
  getCurrentGroupData,
  type CurrentGroupData,
} from "@/services/groupsService";

export default function GroupScreen() {
  const [groupData, setGroupData] = useState<CurrentGroupData | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);

  async function loadGroup() {
    try {
      setIsLoadingGroup(true);

      const loadedGroupData = await getCurrentGroupData();

      setGroupData(loadedGroupData);
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
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>

          <ScreenHeader
            title="Grupo de amigos"
            subtitle="Crea un grupo o únete con un código."
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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
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

          {groupData.members.map((member, index) => (
            <View key={member.id} style={styles.memberRow}>
              <Text style={styles.memberPosition}>#{index + 1}</Text>

              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.playerName}</Text>

                <Text style={styles.memberMeta}>
                  {member.role === "admin" ? "Administrador" : "Miembro"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Grupo conectado</Text>
          <Text style={styles.infoText}>
            Este grupo ya está guardado en Supabase. El siguiente paso será
            calcular el ranking real con las predicciones de sus integrantes.
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
