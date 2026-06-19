import { StyleSheet, Text, View } from 'react-native';

type StatusBadgeProps = {
  label: string;
};

function getStatusStyles(label: string) {
  if (label === 'En vivo') {
    return {
      container: styles.liveContainer,
      text: styles.liveText,
    };
  }

  if (label === 'Finalizado') {
    return {
      container: styles.finishedContainer,
      text: styles.finishedText,
    };
  }

  if (label === 'Por jugar') {
    return {
      container: styles.upcomingContainer,
      text: styles.upcomingText,
    };
  }

  if (label === 'Disponible') {
    return {
      container: styles.availableContainer,
      text: styles.availableText,
    };
  }

  if (label === 'Próximamente') {
    return {
      container: styles.soonContainer,
      text: styles.soonText,
    };
  }

  return {
    container: styles.defaultContainer,
    text: styles.defaultText,
  };
}

export function StatusBadge({ label }: StatusBadgeProps) {
  const statusStyles = getStatusStyles(label);

  return (
    <View style={[styles.badge, statusStyles.container]}>
      <Text style={[styles.text, statusStyles.text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
  },

  liveContainer: {
    backgroundColor: '#FEF2F2',
  },
  liveText: {
    color: '#991B1B',
  },

  finishedContainer: {
    backgroundColor: '#F3F4F6',
  },
  finishedText: {
    color: '#374151',
  },

  upcomingContainer: {
    backgroundColor: '#EFF6FF',
  },
  upcomingText: {
    color: '#1D4ED8',
  },

  availableContainer: {
    backgroundColor: '#ECFDF5',
  },
  availableText: {
    color: '#047857',
  },

  soonContainer: {
    backgroundColor: '#FFFBEB',
  },
  soonText: {
    color: '#92400E',
  },

  defaultContainer: {
    backgroundColor: '#F3F4F6',
  },
  defaultText: {
    color: '#374151',
  },
});