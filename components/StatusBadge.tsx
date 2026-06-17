import { StyleSheet, Text } from 'react-native';

type StatusBadgeProps = {
  label: string;
};

export function StatusBadge({ label }: StatusBadgeProps) {
  const isAvailable = label === 'Disponible';

  return (
    <Text
      style={[
        styles.badge,
        isAvailable ? styles.availableBadge : styles.defaultBadge,
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  availableBadge: {
    color: '#065F46',
    backgroundColor: '#D1FAE5',
  },
  defaultBadge: {
    color: '#111827',
    backgroundColor: '#F3F4F6',
  },
});