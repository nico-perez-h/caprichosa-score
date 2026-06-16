import { FlatList, StyleSheet, Text, View } from 'react-native';

const tournaments = [
  {
    id: 'world-cup-2026',
    name: 'Mundial 2026',
    description: 'Predicciones y partidos del Mundial.',
  },
  {
    id: 'champions-league',
    name: 'Champions League',
    description: 'Próximamente disponible.',
  },
  {
    id: 'premier-league',
    name: 'Premier League',
    description: 'Próximamente disponible.',
  },
  {
    id: 'libertadores',
    name: 'Copa Libertadores',
    description: 'Próximamente disponible.',
  },
];

export default function TournamentsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Torneos</Text>
      <Text style={styles.subtitle}>
        Elige un torneo para ver sus partidos y hacer tus predicciones.
      </Text>

      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
  },
  list: {
    paddingTop: 24,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
});