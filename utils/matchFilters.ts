import type { Match } from '../types/match';

export type MatchFilter =
  | 'all'
  | 'upcoming'
  | 'live'
  | 'finished'
  | 'predicted';

type FilterMatchesParams = {
  matches: Match[];
  selectedFilter: MatchFilter;
  searchTerm?: string;
  hasPrediction: (matchId: string) => boolean;
};

function normalizeText(text: string) {
  return text.trim().toLowerCase();
}

function matchContainsSearchTerm(match: Match, searchTerm: string) {
  const normalizedSearchTerm = normalizeText(searchTerm);

  if (!normalizedSearchTerm) {
    return true;
  }

  const searchableText = normalizeText(
    [
      match.homeTeam,
      match.awayTeam,
      match.tournament,
      match.group,
      match.stadium,
      match.city,
    ].join(' ')
  );

  return searchableText.includes(normalizedSearchTerm);
}

export function filterMatches({
  matches,
  selectedFilter,
  searchTerm = '',
  hasPrediction,
}: FilterMatchesParams) {
  return matches.filter((match) => {
    const matchesSearch = matchContainsSearchTerm(match, searchTerm);

    if (!matchesSearch) {
      return false;
    }

    if (selectedFilter === 'upcoming') {
      return match.status === 'Por jugar';
    }

    if (selectedFilter === 'live') {
      return match.status === 'En vivo';
    }

    if (selectedFilter === 'finished') {
      return match.status === 'Finalizado';
    }

    if (selectedFilter === 'predicted') {
      return hasPrediction(match.id);
    }

    return true;
  });
}