import { router } from "expo-router";
import { useState } from "react";
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
import { findGroupByInviteCode } from "@/services/groupsService";

export default function JoinGroupScreen() {
  const [groupCode, setGroupCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function handleJoinGroup() {
    const cleanCode = groupCode.trim().toUpperCase();

    if (!cleanCode) {
      Alert.alert(
        "Código requerido",
        "Escribe el código del grupo para continuar.",
      );
      return;
    }

    try {
      setIsJoining(true);

      const foundGroup = await findGroupByInviteCode(cleanCode);

      if (!foundGroup) {
        Alert.alert(
          "Código inválido",
          "No encontramos un grupo con ese código.",
        );
        return;
      }

      Alert.alert(
        "Te uniste al grupo",
        `Ahora formas parte de "${foundGroup.name}".`,
        [
          {
            text: "Ver grupo",
            onPress: () => router.replace("/group" as never),
          },
        ],
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo unir al grupo.";

      Alert.alert("Error al unirse", errorMessage);
    } finally {
      setIsJoining(false);
    }
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
          subtitle="Escribe el código que te compartieron para entrar a un grupo."
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Código del grupo</Text>

          <TextInput
            value={groupCode}
            onChangeText={setGroupCode}
            placeholder="Ej: CAP-123456"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
            editable={!isJoining}
          />

          <Pressable
            style={({ pressed }) => [
              styles.joinButton,
              pressed && styles.buttonPressed,
              isJoining && styles.disabledButton,
            ]}
            onPress={handleJoinGroup}
            disabled={isJoining}
          >
            <Text style={styles.joinButtonText}>
              {isJoining ? "Uniéndote..." : "Unirme al grupo"}
            </Text>
          </Pressable>

          <Text style={styles.helperText}>
            Pide el código al administrador del grupo. El código se ve dentro de
            la pantalla del grupo.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Código único</Text>
          <Text style={styles.infoText}>
            Cada grupo tiene un código único. Así puedes entrar al grupo
            correcto aunque existan grupos con nombres parecidos.
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
  card: {
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
  input: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  joinButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.65,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  helperText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
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
