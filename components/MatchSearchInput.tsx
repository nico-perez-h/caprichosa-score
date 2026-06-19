import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type MatchSearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function MatchSearchInput({
  value,
  onChangeText,
}: MatchSearchInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Buscar por equipo..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      {value ? (
        <Pressable style={styles.clearButton} onPress={() => onChangeText('')}>
          <Text style={styles.clearButtonText}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6B7280',
    lineHeight: 24,
  },
});