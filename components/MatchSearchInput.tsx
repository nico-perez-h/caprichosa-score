import { StyleSheet, TextInput, View } from 'react-native';

type MatchSearchInputProps = {
  searchTerm: string;
  onChangeSearchTerm: (searchTerm: string) => void;
};

export function MatchSearchInput({
  searchTerm,
  onChangeSearchTerm,
}: MatchSearchInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        value={searchTerm}
        onChangeText={onChangeSearchTerm}
        placeholder="Buscar equipo, grupo, estadio o ciudad"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  input: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
});