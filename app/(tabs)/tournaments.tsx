import { FlatList, StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/ScreenHeader';
import { TournamentCard } from '@/components/TournamentCard';
import { tournaments } from '@/data/tournaments';

export default function TournamentsScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Torneos"
        subtitle="Elige un torneo para ver sus partidos y hacer tus predicciones."
      />

      <FlatList
        data={tournaments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <TournamentCard tournament={item} />}
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
  list: {
    paddingBottom: 24,
    gap: 12,
  },
});