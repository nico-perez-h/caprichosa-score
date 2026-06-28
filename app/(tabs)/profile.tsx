import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";
import { supabase } from "@/lib/supabase";
import { matches } from "@/data/matches";
import { useAuth } from "@/contexts/AuthContext";
import { usePredictions } from "@/contexts/PredictionsContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { calculatePredictionStats } from "@/utils/predictionStats";

function getInitials(name: string) {
  const words = name.trim().split(" ").filter(Boolean);

  if (words.length === 0) {
    return "JL";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function ProfileScreen() {
  const { predictions } = usePredictions();
  const { playerName, savePlayerName, resetPlayerName } = useUserProfile();
  const { user, signOut } = useAuth();

  const [nameInput, setNameInput] = useState(playerName);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const stats = calculatePredictionStats(matches, predictions);

  useEffect(() => {
    setNameInput(playerName);
  }, [playerName]);

  useEffect(() => {
    async function loadUserRole() {
      if (!user) {
        setIsSuperAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("app_role")
        .eq("id", user.id)
        .single();

      if (error) {
        setIsSuperAdmin(false);
        return;
      }

      setIsSuperAdmin(data?.app_role === "super_admin");
    }

    loadUserRole();
  }, [user]);

  function handleSaveName() {
    savePlayerName(nameInput);

    Alert.alert(
      "Nombre guardado",
      "Tu nombre de jugador se guardó correctamente.",
    );
  }

  function handleResetName() {
    Alert.alert(
      "Restablecer nombre",
      '¿Quieres volver al nombre de prueba "Jugador local"?',
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Restablecer",
          style: "destructive",
          onPress: () => {
            resetPlayerName();

            Alert.alert(
              "Nombre restablecido",
              "Tu nombre volvió a ser Jugador local.",
            );
          },
        },
      ],
    );
  }

  function handleSignOut() {
    Alert.alert(
      "Cerrar sesión",
      "¿Quieres cerrar tu sesión en Caprichosa Score?",
      [
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
      ],
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Perfil"
          subtitle="Edita tu nombre, revisa tus estadísticas y administra tu cuenta."
        />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(playerName)}</Text>
          </View>

          <Text style={styles.userName}>{playerName}</Text>
          <Text style={styles.userDescription}>
            Este nombre se guarda en tu cuenta y aparecerá en rankings y grupos.
          </Text>
        </View>

        <View style={styles.editCard}>
          <Text style={styles.cardTitle}>Nombre de jugador</Text>
          <Text style={styles.cardDescription}>
            Este nombre se guarda en Supabase y se usará para tus grupos y
            rankings.
          </Text>
          <TextInput
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Escribe tu nombre"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSaveName}
          >
            <Text style={styles.saveButtonText}>Guardar nombre</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.resetNameButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleResetName}
          >
            <Text style={styles.resetNameButtonText}>Restablecer nombre</Text>
          </Pressable>
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

        <View style={styles.announcementsCard}>
          <Text style={styles.cardTitle}>Anuncios</Text>

          <View style={styles.announcementItem}>
            <Text style={styles.announcementTitle}>
              Próximamente nuevos torneos
            </Text>
            <Text style={styles.announcementDescription}>
              Después del Mundial podremos agregar Champions League, Premier
              League, Copa Libertadores y otros torneos.
            </Text>
          </View>

          {isSuperAdmin ? (
            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Panel interno</Text>
              <Text style={styles.settingDescription}>
                Carga resultados reales manualmente y controla datos internos de
                la app.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.groupButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.push("/super-admin-results" as never)}
              >
                <Text style={styles.groupButtonText}>Cargar resultados</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.announcementItem}>
            <Text style={styles.announcementTitle}>Grupos con amigos</Text>
            <Text style={styles.announcementDescription}>
              Muy pronto podrás crear grupos, invitar personas y competir en
              rankings privados.
            </Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Configuración</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Grupo de amigos</Text>
            <Text style={styles.settingDescription}>
              Aquí podrás crear o unirte a grupos para competir con tus amigos.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.groupButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push("/group" as never)}
            >
              <Text style={styles.groupButtonText}>Ver grupo de amigos</Text>
            </Pressable>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Cuenta</Text>
            <Text style={styles.settingDescription}>
              Sesión iniciada como {user?.email ?? "usuario registrado"}.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.signOutButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutButtonText}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Cuenta conectada</Text>
          <Text style={styles.infoText}>
            Tu sesión y nombre de jugador ya están conectados con Supabase.
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
  profileCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },
  userDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#D1D5DB",
    textAlign: "center",
  },
  editCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  saveButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  resetNameButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  resetNameButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#374151",
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  announcementsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  announcementItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  announcementDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  settingsCard: {
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
    marginBottom: 14,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 14,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: "#6B7280",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  settingItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },
  settingDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#6B7280",
  },
  groupButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  groupButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  signOutButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  signOutButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#991B1B",
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
