import { FlatList, StyleSheet, Text, View } from 'react-native';

const matches = [
  {
    id: '1',
    homeTeam: 'Argentina',
    awayTeam: 'México',
    date: 'Próximamente',
    tournament: 'Mundial 2026',
  },
  {
    id: '2',
    homeTeam: 'España',
    awayTeam: 'Brasil',
    date: 'Próximamente',
    tournament: 'Mundial 2026',
  },
  {
    id: '3',
    homeTeam: 'Francia',
    awayTeam: 'Alemania',
    date: 'Próximamente',
    tournament: 'Mundial 2026',
  },
];

export default function MatchesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Partidos</Text>
      <Text style={styles.subtitle}>
        Aquí verás los partidos disponibles para predecir.
      </Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.tournament}>{item.tournament}</Text>

            <View style={styles.matchRow}>
              <Text style={styles.team}>{item.homeTeam}</Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.team}>{item.awayTeam}</Text>
            </View>

            <Text style={styles.date}>{item.date}</Text>
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
  tournament: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  vs: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    paddingHorizontal: 12,
  },
  date: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});