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
import { matches } from "@/data/matches";
import { usePredictions } from "../contexts/PredictionsContext";
import { useUserProfile } from "../contexts/UserProfileContext";
import { calculatePredictionStats } from "../utils/predictionStats";

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
  const { predictions, clearPredictions } = usePredictions();
  const { playerName, savePlayerName, resetPlayerName } = useUserProfile();

  const [nameInput, setNameInput] = useState(playerName);

  const stats = calculatePredictionStats(matches, predictions);
  const totalPredictions = Object.keys(predictions).length;

  useEffect(() => {
    setNameInput(playerName);
  }, [playerName]);

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

  function handleClearPredictions() {
    if (totalPredictions === 0) {
      Alert.alert(
        "Sin predicciones",
        "No tienes predicciones guardadas para borrar.",
      );
      return;
    }

    Alert.alert(
      "Borrar predicciones",
      "¿Estás seguro de que quieres borrar todas tus predicciones guardadas? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Borrar todo",
          style: "destructive",
          onPress: () => {
            clearPredictions();

            Alert.alert(
              "Predicciones borradas",
              "Todas tus predicciones fueron eliminadas.",
            );
          },
        },
      ],
    );
  }

  function handleResetTestData() {
    Alert.alert(
      "Restablecer datos de prueba",
      'Esto borrará todas tus predicciones y volverá tu nombre a "Jugador local". Esta acción no se puede deshacer.',
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Restablecer todo",
          style: "destructive",
          onPress: () => {
            clearPredictions();
            resetPlayerName();

            Alert.alert(
              "Datos restablecidos",
              "Tus datos de prueba fueron reiniciados correctamente.",
            );
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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </Pressable>

        <ScreenHeader
          title="Perfil"
          subtitle="Edita tu nombre, revisa tus estadísticas y prepara tu cuenta para competir."
        />

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(playerName)}</Text>
          </View>

          <Text style={styles.userName}>{playerName}</Text>
          <Text style={styles.userDescription}>
            Este será el nombre que aparecerá en tu ranking local.
          </Text>
        </View>

        <View style={styles.editCard}>
          <Text style={styles.cardTitle}>Nombre de jugador</Text>

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

        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Configuración futura</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingTitle}>Grupo de amigos</Text>
            <Text style={styles.settingDescription}>
              Aquí se mostrarán los grupos donde compites con otras personas.
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
              Más adelante agregaremos inicio de sesión, cerrar sesión y datos
              de cuenta.
            </Text>
          </View>
        </View>

        <View style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>Zona de pruebas</Text>
          <Text style={styles.dangerText}>
            Usa estas opciones para reiniciar pruebas de la app sin
            desinstalarla.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleClearPredictions}
          >
            <Text style={styles.deleteButtonText}>
              Borrar todas las predicciones
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.resetAllButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleResetTestData}
          >
            <Text style={styles.resetAllButtonText}>
              Restablecer datos de prueba
            </Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Versión de prueba</Text>
          <Text style={styles.infoText}>
            Esta pantalla todavía usa datos locales. Cuando conectemos Supabase,
            aquí podremos mostrar tu nombre real, email, grupos, amigos y
            estadísticas guardadas en la nube.
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
  dangerCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#991B1B",
    marginBottom: 8,
  },
  dangerText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#7F1D1D",
    marginBottom: 14,
  },
  deleteButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#991B1B",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  resetAllButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#7F1D1D",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  resetAllButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
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
