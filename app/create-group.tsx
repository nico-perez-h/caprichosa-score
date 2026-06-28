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

import { usePredictions } from '@/contexts/PredictionsContext';
import { ScreenHeader } from "@/components/ScreenHeader";
import { createGroup } from "@/services/groupsService";

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { reloadPredictions } = usePredictions();

  async function handleCreateGroup() {
    const cleanGroupName = groupName.trim();

    if (!cleanGroupName) {
      Alert.alert("Nombre requerido", "Escribe un nombre para crear tu grupo.");
      return;
    }

    try {
      setIsCreating(true);

      const createdGroup = await createGroup({
        name: cleanGroupName,
        description: groupDescription,
      });

      await reloadPredictions();

      Alert.alert(
        "Grupo creado",
        `Tu grupo "${createdGroup.name}" fue creado correctamente.`,
        [
          {
            text: "Entrar",
            onPress: () => router.replace("/(tabs)" as never),
          },
        ],
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo crear el grupo.";

      Alert.alert("Error al crear grupo", errorMessage);
    } finally {
      setIsCreating(false);
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
          title="Crear grupo"
          subtitle="Crea un grupo para competir con tus amigos o familia."
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos del grupo</Text>

          <Text style={styles.inputLabel}>Nombre del grupo</Text>
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Ej: Mundial con amigos"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            editable={!isCreating}
          />

          <Text style={styles.inputLabel}>Descripción opcional</Text>
          <TextInput
            value={groupDescription}
            onChangeText={setGroupDescription}
            placeholder="Ej: Grupo para competir durante el Mundial"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.descriptionInput]}
            multiline
            editable={!isCreating}
          />

          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.buttonPressed,
              isCreating && styles.disabledButton,
            ]}
            onPress={handleCreateGroup}
            disabled={isCreating}
          >
            <Text style={styles.createButtonText}>
              {isCreating ? "Creando grupo..." : "Crear grupo"}
            </Text>
          </Pressable>

          <Text style={styles.helperText}>
            Al crear el grupo, tú serás el administrador y también podrás
            participar con tus propias predicciones.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Código del grupo</Text>
          <Text style={styles.infoText}>
            Después de crear el grupo recibirás un código único. Tus amigos
            podrán usarlo para unirse desde la app.
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
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 42,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  descriptionInput: {
    minHeight: 92,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  createButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.65,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  helperText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 10,
    marginTop: 8,
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
