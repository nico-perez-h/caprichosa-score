import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { matches } from "@/data/matches";
import { mockRankingPlayers } from "@/data/mockRankingPlayers";
import { usePredictions } from "../contexts/PredictionsContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import { calculatePredictionStats } from "../utils/predictionStats";

const GROUP_INVITE_CODE = "CAPRI-2026";

export default function GroupScreen() {
  const { predictions } = usePredictions();
  const { playerName } = useUserProfile();

  const stats = calculatePredictionStats(matches, predictions);

  const groupMembers = [
    {
      id: "current-user",
      name: playerName,
      points: stats.totalPoints,
      predictions: stats.totalPredictions,
      isCurrentUser: true,
    },
    ...mockRankingPlayers.map((player) => ({
      id: player.id,
      name: player.name,
      points: player.points,
      predictions: player.predictions,
      isCurrentUser: false,
    })),
  ].sort(
    (firstPlayer, secondPlayer) => secondPlayer.points - firstPlayer.points,
  );

  const totalGroupPoints = groupMembers.reduce(
    (total, member) => total + member.points,
    0,
  );

  const totalGroupPredictions = groupMembers.reduce(
    (total, member) => total + member.predictions,
    0,
  );

  async function handleCopyGroupCode() {
    await Clipboard.setStringAsync(GROUP_INVITE_CODE);

    Alert.alert(
      "Código copiado",
      `El código ${GROUP_INVITE_CODE} fue copiado correctamente.`,
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
          title="Grupo de amigos"
          subtitle="Compite con tus amigos dentro de un grupo privado."
        />

        <View style={styles.groupCard}>
          <Text style={styles.groupLabel}>Grupo de prueba</Text>
          <Text style={styles.groupName}>Caprichosa Mundial</Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Código de invitación</Text>
            <Text style={styles.codeText}>{GROUP_INVITE_CODE}</Text>
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
          <Pressable
            style={({ pressed }) => [
              styles.joinButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/join-group" as never)}
          >
            <Text style={styles.joinButtonText}>Unirse con código</Text>
          </Pressable>

          <Text style={styles.groupDescription}>
            Este código es de prueba. Más adelante servirá para invitar amigos
            reales al grupo.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{groupMembers.length}</Text>
            <Text style={styles.statLabel}>Integrantes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalGroupPoints}</Text>
            <Text style={styles.statLabel}>Puntos del grupo</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalGroupPredictions}</Text>
            <Text style={styles.statLabel}>Predicciones</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>1</Text>
            <Text style={styles.statLabel}>Torneo activo</Text>
          </View>
        </View>

        <View style={styles.membersCard}>
          <Text style={styles.cardTitle}>Integrantes</Text>

          {groupMembers.map((member, index) => (
            <View
              key={member.id}
              style={[
                styles.memberRow,
                member.isCurrentUser && styles.currentUserRow,
              ]}
            >
              <Text
                style={[
                  styles.memberPosition,
                  member.isCurrentUser && styles.currentUserText,
                ]}
              >
                #{index + 1}
              </Text>

              <View style={styles.memberInfo}>
                <Text
                  style={[
                    styles.memberName,
                    member.isCurrentUser && styles.currentUserText,
                  ]}
                >
                  {member.name}
                </Text>

                <Text
                  style={[
                    styles.memberMeta,
                    member.isCurrentUser && styles.currentUserMetaText,
                  ]}
                >
                  {member.predictions} predicciones
                </Text>
              </View>

              <Text
                style={[
                  styles.memberPoints,
                  member.isCurrentUser && styles.currentUserText,
                ]}
              >
                {member.points} pts
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Próximamente</Text>
          <Text style={styles.infoText}>
            Luego podrás crear grupos reales, invitar amigos con un código,
            aceptar solicitudes y ver el ranking de cada grupo usando Supabase.
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
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  joinButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  groupDescription: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "47.8%",
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
  currentUserRow: {
    backgroundColor: "#F9FAFB",
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 14,
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
  memberPoints: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  currentUserText: {
    color: "#111827",
  },
  currentUserMetaText: {
    color: "#374151",
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
