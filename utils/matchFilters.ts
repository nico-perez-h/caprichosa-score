import type { Match } from '../types/match';

export type MatchFilter = 'all' | 'upcoming' | 'finished' | 'predicted';

type FilterMatchesParams = {
  matches: Match[];
  selectedFilter: MatchFilter;
  hasPrediction: (matchId: string) => boolean;
};

export function filterMatches({
  matches,
  selectedFilter,
  hasPrediction,
}: FilterMatchesParams) {
  return matches.filter((match) => {
    if (selectedFilter === 'upcoming') {
      return match.status === 'Por jugar';
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