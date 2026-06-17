import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { matches } from '@/data/matches';

export default function MatchesScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Partidos"
        subtitle="Aquí verás los partidos disponibles para predecir."
      />

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => router.push(`/match/${item.id}` as never)}
          />
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
  list: {
    paddingBottom: 24,
    gap: 12,
  },
});