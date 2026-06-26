import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchCard } from '@/components/MatchCard';
import { MatchSearchInput } from '@/components/MatchSearchInput';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Prediction } from '../../contexts/PredictionsContext';
import { usePredictions } from '../../contexts/PredictionsContext';
import {
  getPredictableMatchesOnly,
  getTodayMatches,
} from '../../services/matchesService';
import type { Match } from '../../types/match';
import { filterMatches, type MatchFilter } from '../../utils/matchFilters';

type StatusOption = {
  label: string;
  value: MatchFilter;
};

type UpcomingSection = {
  title: string;
  description: string;
  data: Match[];
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    label: 'Todos',
    value: 'all',
  },
  {
    label: 'Por jugar',
    value: 'upcoming',
  },
  {
    label: 'En vivo',
    value: 'live',
  },
  {
    label: 'Finalizados',
    value: 'finished',
  },
];

function getSelectedStatusLabel(selectedFilter: MatchFilter) {
  const selectedOption = STATUS_OPTIONS.find(
    (option) => option.value === selectedFilter
  );

  return selectedOption?.label ?? 'Todos';
}

function parseMatchDate(match: Match) {
  const [day, month, year] = match.date.split('/');
  const [hour, minute] = match.kickoffTime.split(':');

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDifferenceInDays(match: Match) {
  const today = normalizeDate(new Date());
  const matchDate = normalizeDate(parseMatchDate(match));

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.round(
    (matchDate.getTime() - today.getTime()) / millisecondsPerDay
  );
}

function sortMatchesByDate(matches: Match[]) {
  return [...matches].sort((firstMatch, secondMatch) => {
    return (
      parseMatchDate(firstMatch).getTime() - parseMatchDate(secondMatch).getTime()
    );
  });
}

function isPlaceholderTeam(teamName: string) {
  const cleanTeamName = teamName.trim().toLowerCase();

  return (
    cleanTeamName.includes('tbd') ||
    cleanTeamName.includes('por definir') ||
    cleanTeamName.includes('winner') ||
    cleanTeamName.includes('ganador') ||
    cleanTeamName.includes('1st group') ||
    cleanTeamName.includes('2nd group') ||
    cleanTeamName.includes('3rd group') ||
    cleanTeamName.includes('local') ||
    cleanTeamName.includes('visitante')
  );
}

function isConfirmedMatch(match: Match) {
  return (
    !isPlaceholderTeam(match.homeTeam) &&
    !isPlaceholderTeam(match.awayTeam) &&
    match.homeTeam.trim().length > 0 &&
    match.awayTeam.trim().length > 0
  );
}

function searchMatches(matches: Match[], searchTerm: string) {
  const cleanSearchTerm = searchTerm.trim().toLowerCase();

  if (!cleanSearchTerm) {
    return matches;
  }

  return matches.filter((match) => {
    const searchableText = [
      match.homeTeam,
      match.awayTeam,
      match.tournament,
      match.group,
      match.stadium,
      match.city,
      match.date,
      match.kickoffTime,
      match.status,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(cleanSearchTerm);
  });
}

function buildUpcomingSections(matches: Match[]): UpcomingSection[] {
  const todayMatches = matches.filter((match) => getDifferenceInDays(match) === 0);
  const tomorrowMatches = matches.filter(
    (match) => getDifferenceInDays(match) === 1
  );
  const weekMatches = matches.filter((match) => {
    const differenceInDays = getDifferenceInDays(match);

    return differenceInDays >= 2 && differenceInDays <= 7;
  });
  const nextConfirmedMatches = matches.filter((match) => {
    const differenceInDays = getDifferenceInDays(match);

    return differenceInDays > 7;
  });

  return [
    {
      title: 'Hoy',
      description: 'Partidos disponibles para predecir hoy.',
      data: todayMatches,
    },
    {
      title: 'Mañana',
      description: 'Partidos confirmados para el día siguiente.',
      data: tomorrowMatches,
    },
    {
      title: 'Esta semana',
      description: 'Próximos partidos confirmados de los siguientes días.',
      data: weekMatches,
    },
    {
      title: 'Próximos confirmados',
      description: 'Partidos del Mundial que ya tienen ambos equipos definidos.',
      data: nextConfirmedMatches,
    },
  ].filter((section) => section.data.length > 0);
}

export default function MatchesScreen() {
  const { predictions } = usePredictions();

  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<MatchFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      setIsLoadingMatches(true);

      const [loadedTodayMatches, loadedUpcomingMatches] = await Promise.all([
        getTodayMatches(),
        getPredictableMatchesOnly(),
      ]);

      const confirmedUpcomingMatches = sortMatchesByDate(
        loadedUpcomingMatches.filter(isConfirmedMatch)
      );

      setTodayMatches(loadedTodayMatches);
      setUpcomingMatches(confirmedUpcomingMatches);
      setIsLoadingMatches(false);
    }

    loadMatches();
  }, []);

  function hasPrediction(matchId: string) {
    return Boolean((predictions as Record<string, Prediction>)[matchId]);
  }

  function openMatch(matchId: string) {
    router.push(`/match/${matchId}` as never);
  }

  function selectStatusFilter(filter: MatchFilter) {
    setSelectedFilter(filter);
    setIsStatusDropdownOpen(false);
  }

  const filteredTodayMatches = filterMatches({
    matches: todayMatches,
    selectedFilter,
    searchTerm,
    hasPrediction,
  });

  const filteredUpcomingMatches = searchMatches(upcomingMatches, searchTerm);

  const upcomingSections = useMemo(
    () => buildUpcomingSections(filteredUpcomingMatches),
    [filteredUpcomingMatches]
  );

  const shouldShowUpcomingMode = selectedFilter === 'upcoming';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Partidos"
          subtitle="Revisa partidos de hoy y próximos partidos disponibles para predecir."
        />

        <MatchSearchInput
          searchTerm={searchTerm}
          onChangeSearchTerm={setSearchTerm}
        />

        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Estado del partido</Text>

          <Pressable
            style={({ pressed }) => [
              styles.dropdownButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
          >
            <Text style={styles.dropdownButtonText}>
              {getSelectedStatusLabel(selectedFilter)}
            </Text>

            <Text style={styles.dropdownIcon}>
              {isStatusDropdownOpen ? '▲' : '▼'}
            </Text>
          </Pressable>

          {isStatusDropdownOpen ? (
            <View style={styles.dropdownOptions}>
              {STATUS_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.dropdownOption,
                    selectedFilter === option.value &&
                      styles.selectedDropdownOption,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => selectStatusFilter(option.value)}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selectedFilter === option.value &&
                        styles.selectedDropdownOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {isLoadingMatches ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Cargando partidos...</Text>
            <Text style={styles.emptyText}>
              Estamos preparando los partidos disponibles para predecir.
            </Text>
          </View>
        ) : null}

        {!isLoadingMatches && shouldShowUpcomingMode ? (
          <>
            {upcomingSections.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  No hay próximos partidos confirmados
                </Text>
                <Text style={styles.emptyText}>
                  Cuando el Mundial confirme nuevos cruces, aparecerán aquí.
                </Text>
              </View>
            ) : null}

            {upcomingSections.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>
                  {section.description}
                </Text>

                {section.data.map((match) => (
                  <View key={match.id} style={styles.matchCardWrapper}>
                    <MatchCard
                      match={match}
                      savedPrediction={predictions[match.id] ?? null}
                      onPress={() => openMatch(match.id)}
                    />
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : null}

        {!isLoadingMatches &&
        !shouldShowUpcomingMode &&
        filteredTodayMatches.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No encontramos partidos</Text>
            <Text style={styles.emptyText}>
              Prueba con otro estado o cambia el texto de búsqueda.
            </Text>
          </View>
        ) : null}

        {!isLoadingMatches && !shouldShowUpcomingMode
          ? filteredTodayMatches.map((match) => (
              <View key={match.id} style={styles.matchCardWrapper}>
                <MatchCard
                  match={match}
                  savedPrediction={predictions[match.id] ?? null}
                  onPress={() => openMatch(match.id)}
                />
              </View>
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
  },
  dropdownButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginRight: 10,
  },
  dropdownIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B7280',
  },
  dropdownOptions: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownOption: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedDropdownOption: {
    backgroundColor: '#111827',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  selectedDropdownOptionText: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  matchCardWrapper: {
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  buttonPressed: {
    opacity: 0.75,
  },
});