import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/ScreenHeader";

export default function RulesScreen() {
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
          title="Reglas oficiales"
          subtitle="Sistema de puntuación y condiciones de Caprichosa Score."
        />

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Caprichosa Score</Text>
          <Text style={styles.heroText}>
            Cada participante debe pronosticar el marcador de los partidos antes
            del cierre establecido. Los puntos se calculan según el marcador
            exacto, el ganador o empate correcto y la diferencia de goles.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>1</Text>
          <Text style={styles.sectionTitle}>Sistema de puntuación</Text>

          <Text style={styles.paragraph}>
            Cada partido puede otorgar un máximo de 9 puntos durante la fase de
            grupos.
          </Text>

          <View style={styles.pointsTable}>
            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Marcador exacto</Text>
              <Text style={styles.pointsValue}>9 pts</Text>
            </View>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>
                Ganador o empate correcto + diferencia correcta
              </Text>
              <Text style={styles.pointsValue}>4 pts</Text>
            </View>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>
                Ganador correcto o empate correcto
              </Text>
              <Text style={styles.pointsValue}>3 pts</Text>
            </View>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Resultado incorrecto</Text>
              <Text style={styles.pointsValue}>0 pts</Text>
            </View>
          </View>

          <View style={styles.exampleCard}>
            <Text style={styles.exampleTitle}>Ejemplo</Text>
            <Text style={styles.exampleText}>Pronóstico: 2-0</Text>
            <Text style={styles.exampleText}>Resultado final: 3-1</Text>
            <Text style={styles.exampleText}>
              Ganador correcto: +3 puntos
            </Text>
            <Text style={styles.exampleText}>
              Diferencia de goles correcta: +1 punto
            </Text>
            <Text style={styles.exampleTotal}>Total: 4 puntos</Text>
          </View>

          <View style={styles.exampleCard}>
            <Text style={styles.exampleTitle}>Ejemplo con empate</Text>
            <Text style={styles.exampleText}>Pronóstico: 1-1</Text>
            <Text style={styles.exampleText}>Resultado final: 2-2</Text>
            <Text style={styles.exampleText}>Empate correcto: +3 puntos</Text>
            <Text style={styles.exampleText}>
              Diferencia correcta: +1 punto
            </Text>
            <Text style={styles.exampleTotal}>Total: 4 puntos</Text>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              Para obtener los 9 puntos completos se debe acertar el marcador
              exacto.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>2</Text>
          <Text style={styles.sectionTitle}>Cierre de pronósticos</Text>

          <Text style={styles.paragraph}>
            Los pronósticos pueden enviarse o modificarse hasta el tiempo de
            cierre definido por el administrador del grupo.
          </Text>

          <Text style={styles.paragraph}>
            Si el grupo no tiene un tiempo especial configurado, los pronósticos
            se cerrarán cuando el partido deje de estar en estado Por jugar y pasa a 
            estado En vivo.
          </Text>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>
              Una vez cerrado el partido, el pronóstico ya no podrá modificarse.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>3</Text>
          <Text style={styles.sectionTitle}>Rondas eliminatorias</Text>

          <Text style={styles.paragraph}>
            Para las rondas eliminatorias se tomarán en cuenta los 120 minutos
            de juego: 90 minutos reglamentarios más 30 minutos de tiempo extra.
          </Text>

          <Text style={styles.paragraph}>
            En eliminatorias, un partido puede otorgar hasta 18 puntos en total,
            pero solo si el usuario pronosticó empate en los 120 minutos y
            luego acierta también la tanda de penales.
          </Text>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Importante</Text>
            <Text style={styles.warningText}>
              Si un usuario pronostica ganador durante los 120 minutos y el
              partido termina empatado para definirse en penales, no participa
              en la predicción de penales.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>4</Text>
          <Text style={styles.sectionTitle}>Pronósticos de penales</Text>

          <Text style={styles.paragraph}>
            Si un usuario pronostica empate en el partido, también podrá indicar
            su pronóstico de penales.
          </Text>

          <Text style={styles.paragraph}>
            Si luego cambia su pronóstico y deja de ser empate, el pronóstico de
            penales se ocultará y se eliminará.
          </Text>

          <View style={styles.pointsTable}>
            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Marcador exacto de penales</Text>
              <Text style={styles.pointsValue}>9 pts</Text>
            </View>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>
                Ganador de penales + diferencia correcta
              </Text>
              <Text style={styles.pointsValue}>4 pts</Text>
            </View>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Ganador de penales</Text>
              <Text style={styles.pointsValue}>3 pts</Text>
            </View>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Pronóstico incorrecto</Text>
              <Text style={styles.pointsValue}>0 pts</Text>
            </View>
          </View>

          <View style={styles.exampleCard}>
            <Text style={styles.exampleTitle}>Ejemplo</Text>
            <Text style={styles.exampleText}>120 minutos: 2-2</Text>
            <Text style={styles.exampleText}>Penales: Equipo A gana 4-3</Text>
            <Text style={styles.exampleText}>
              Si el resultado final coincide, obtiene 9 puntos por los 120
              minutos y 9 puntos por penales.
            </Text>
            <Text style={styles.exampleTotal}>Total: 18 puntos</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>5</Text>
          <Text style={styles.sectionTitle}>Aclaración importante</Text>

          <Text style={styles.questionText}>
            ¿Qué pasa si un usuario pronostica ganador al Equipo A, pero el
            Equipo A gana solamente en penales?
          </Text>

          <Text style={styles.paragraph}>
            No obtiene puntos por ganador del partido ni puede participar en la
            predicción de penales.
          </Text>

          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              El sistema considera como resultado principal lo ocurrido en los
              120 minutos. Para participar en penales, el usuario debe haber
              pronosticado empate.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>6</Text>
          <Text style={styles.sectionTitle}>Premios</Text>

          <Text style={styles.prizeTitle}>Primer lugar</Text>
          <Text style={styles.paragraph}>
            Recibe el total acumulado de la polla, menos 25 Bs correspondientes
            al premio del segundo lugar.
          </Text>

          <Text style={styles.prizeTitle}>Segundo lugar</Text>
          <Text style={styles.paragraph}>
            Recupera su inscripción de 25 Bs.
          </Text>

          <Text style={styles.prizeTitle}>Empates</Text>
          <Text style={styles.paragraph}>
            Si existe empate en el primer lugar, el premio se divide entre los
            ganadores. Si existe empate en el segundo lugar, los 25 Bs se
            dividen entre los participantes empatados.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>7</Text>
          <Text style={styles.sectionTitle}>Consideraciones finales</Text>

          <Text style={styles.paragraph}>
            Los pronósticos de los partidos se realizarán mediante la
            aplicación. Los penales se contabilizarán por separado cuando
            corresponda.
          </Text>

          <Text style={styles.paragraph}>
            Solo podrán pronosticar penales los usuarios que hayan elegido
            empate en los 120 minutos.
          </Text>

          <Text style={styles.paragraph}>
            Ante cualquier duda o consulta, la organización estará disponible
            para aclararla.
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
    paddingBottom: 36,
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
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  heroText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  sectionNumber: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "#111827",
    color: "#FFFFFF",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 10,
  },
  pointsTable: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 14,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
  },
  pointsLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    color: "#374151",
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },
  exampleCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginTop: 10,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#991B1B",
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#7F1D1D",
    marginBottom: 3,
  },
  exampleTotal: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "900",
    color: "#991B1B",
  },
  noteCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#374151",
  },
  warningCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginTop: 8,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#92400E",
    marginBottom: 6,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#92400E",
  },
  questionText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  prizeTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginTop: 4,
    marginBottom: 4,
  },
});