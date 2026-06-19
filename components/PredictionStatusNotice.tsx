import { StyleSheet, Text, View } from 'react-native';

import type { MatchStatus } from '@/types/match';

type PredictionStatusNoticeProps = {
  status: MatchStatus;
};

export function PredictionStatusNotice({ status }: PredictionStatusNoticeProps) {
  if (status === 'En vivo') {
    return (
      <View style={[styles.card, styles.liveCard]}>
        <Text style={[styles.title, styles.liveTitle]}>
          Predicciones cerradas
        </Text>
        <Text style={[styles.text, styles.liveText]}>
          Este partido ya está en vivo. Para que el juego sea justo, ya no se
          pueden crear, modificar ni eliminar predicciones.
        </Text>
      </View>
    );
  }

  if (status === 'Finalizado') {
    return (
      <View style={[styles.card, styles.finishedCard]}>
        <Text style={[styles.title, styles.finishedTitle]}>
          Partido finalizado
        </Text>
        <Text style={[styles.text, styles.finishedText]}>
          Este partido ya terminó. Puedes ver tu predicción guardada y los
          puntos obtenidos, pero ya no puedes cambiarla.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.upcomingCard]}>
      <Text style={[styles.title, styles.upcomingTitle]}>
        Predicción abierta
      </Text>
      <Text style={[styles.text, styles.upcomingText]}>
        Todavía puedes guardar o actualizar tu predicción antes de que empiece
        el partido.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },

  liveCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  liveTitle: {
    color: '#991B1B',
  },
  liveText: {
    color: '#7F1D1D',
  },

  finishedCard: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  finishedTitle: {
    color: '#374151',
  },
  finishedText: {
    color: '#4B5563',
  },

  upcomingCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  upcomingTitle: {
    color: '#1D4ED8',
  },
  upcomingText: {
    color: '#1E40AF',
  },
});