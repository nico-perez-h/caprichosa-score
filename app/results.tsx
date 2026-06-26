import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatchCard } from '@/components/MatchCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { usePredictions } from '../contexts/PredictionsContext';
import { getFinishedMatches } from '../services/matchesService';
import type { Match } from '../types/match';

type ResultsSection = {
  title: string;
  description: string;
  data: Match[];
};

type FilterDropdownProps = {
  label: string;
  value: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

const ALL_COUNTRIES_OPTION = 'Todos los países';
const ALL_GROUPS_OPTION = 'Todos los grupos';

function getUniqueCountries(matches: Match[]) {
  const countries = matches.flatMap((match) => [
    match.homeTeam,
    match.awayTeam,
  ]);

  return Array.from(new Set(countries)).sort((a, b) => a.localeCompare(b));
}

function getUniqueGroups(matches: Match[]) {
  const groups = matches.map((match) => match.group);

  return Array.from(new Set(groups)).sort((a, b) => a.localeCompare(b));
}

function filterFinishedMatches({
  matches,
  selectedCountry,
  selectedGroup,
}: {
  matches: Match[];
  selectedCountry: string;
  selectedGroup: string;
}) {
  return matches.filter((match) => {
    const matchesCountry =
      selectedCountry === ALL_COUNTRIES_OPTION ||
      match.homeTeam === selectedCountry ||
      match.awayTeam === selectedCountry;

    const matchesGroup =
      selectedGroup === ALL_GROUPS_OPTION || match.group === selectedGroup;

    return matchesCountry && matchesGroup;
  });
}

function FilterDropdown({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: FilterDropdownProps) {
  return (
    <View style={styles.dropdownWrapper}>
      <Text style={styles.dropdownLabel}>{label}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.dropdownButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onToggle}
      >
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <Text style={styles.dropdownIcon}>{isOpen ? '▲' : '▼'}</Text>
      </Pressable>

      {isOpen ? (
        <View style={styles.dropdownOptions}>
          {options.map((option) => (
            <Pressable
              key={option}
              style={({ pressed }) => [
                styles.dropdownOption,
                option === value && styles.selectedDropdownOption,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  option === value && styles.selectedDropdownOptionText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function ResultsScreen() {
  const { getPrediction } = usePredictions();

  const [finishedMatches, setFinishedMatches] = useState<Match[]>([]);
  const [selectedCountry, setSelectedCountry] = useState(ALL_COUNTRIES_OPTION);
  const [selectedGroup, setSelectedGroup] = useState(ALL_GROUPS_OPTION);
  const [openDropdown, setOpenDropdown] = useState<'country' | 'group' | null>(
    null
  );
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  useEffect(() => {
    async function loadFinishedMatches() {
      setIsLoadingMatches(true);

      const loadedMatches = await getFinishedMatches();

      setFinishedMatches(loadedMatches);
      setIsLoadingMatches(false);
    }

    loadFinishedMatches();
  }, []);

  const countryOptions = useMemo(
    () => [ALL_COUNTRIES_OPTION, ...getUniqueCountries(finishedMatches)],
    [finishedMatches]
  );

  const groupOptions = useMemo(
    () => [ALL_GROUPS_OPTION, ...getUniqueGroups(finishedMatches)],
    [finishedMatches]
  );

  const filteredFinishedMatches = filterFinishedMatches({
    matches: finishedMatches,
    selectedCountry,
    selectedGroup,
  });

  const matchesWithPrediction = filteredFinishedMatches.filter((match) =>
    Boolean(getPrediction(match.id))
  );

  const matchesWithoutPrediction = filteredFinishedMatches.filter(
    (match) => !getPrediction(match.id)
  );

  const sections: ResultsSection[] = [
    {
      title: 'Con predicción',
      description: 'Partidos finalizados donde guardaste una predicción.',
      data: matchesWithPrediction,
    },
    {
      title: 'Sin predicción',
      description: 'Partidos finalizados donde no guardaste predicción.',
      data: matchesWithoutPrediction,
    },
  ].filter((section) => section.data.length > 0);

  function handleSelectCountry(country: string) {
    setSelectedCountry(country);
    setOpenDropdown(null);
  }

  function handleSelectGroup(group: string) {
    setSelectedGroup(group);
    setOpenDropdown(null);
  }

  function clearFilters() {
    setSelectedCountry(ALL_COUNTRIES_OPTION);
    setSelectedGroup(ALL_GROUPS_OPTION);
    setOpenDropdown(null);
  }

  const hasActiveFilters =
    selectedCountry !== ALL_COUNTRIES_OPTION ||
    selectedGroup !== ALL_GROUPS_OPTION;

  return (
    <SafeAreaView style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Volver</Text>
            </Pressable>

            <ScreenHeader
              title="Resultados"
              subtitle="Filtra partidos finalizados por país y grupo."
            />

            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {filteredFinishedMatches.length}
                </Text>
                <Text style={styles.summaryLabel}>Finalizados</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {matchesWithPrediction.length}
                </Text>
                <Text style={styles.summaryLabel}>Con predicción</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {matchesWithoutPrediction.length}
                </Text>
                <Text style={styles.summaryLabel}>Sin predicción</Text>
              </View>
            </View>

            <View style={styles.filtersCard}>
              <Text style={styles.filtersTitle}>Filtros</Text>

              <FilterDropdown
                label="País"
                value={selectedCountry}
                options={countryOptions}
                isOpen={openDropdown === 'country'}
                onToggle={() =>
                  setOpenDropdown(
                    openDropdown === 'country' ? null : 'country'
                  )
                }
                onSelect={handleSelectCountry}
              />

              <FilterDropdown
                label="Grupo / Fase"
                value={selectedGroup}
                options={groupOptions}
                isOpen={openDropdown === 'group'}
                onToggle={() =>
                  setOpenDropdown(openDropdown === 'group' ? null : 'group')
                }
                onSelect={handleSelectGroup}
              />

              {hasActiveFilters ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearButtonText}>Limpiar filtros</Text>
                </Pressable>
              ) : null}
            </View>

            {isLoadingMatches ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Cargando resultados...</Text>
                <Text style={styles.emptyText}>
                  Estamos buscando los partidos finalizados del Mundial.
                </Text>
              </View>
            ) : null}
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionDescription}>{section.description}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.matchWrapper}>
            <MatchCard
              match={item}
              savedPrediction={getPrediction(item.id)}
              onPress={() => router.push(`/match/${item.id}` as never)}
            />
          </View>
        )}
        ListEmptyComponent={
          !isLoadingMatches ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {hasActiveFilters
                  ? 'No hay resultados con esos filtros'
                  : 'Aún no hay resultados'}
              </Text>
              <Text style={styles.emptyText}>
                {hasActiveFilters
                  ? 'Prueba seleccionando otro país o grupo.'
                  : 'Cuando haya partidos finalizados, aparecerán aquí.'}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#E5E7EB',
  },
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 14,
  },
  dropdownWrapper: {
    marginBottom: 12,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#6B7280',
    marginBottom: 8,
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
  clearButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  sectionDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  matchWrapper: {
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