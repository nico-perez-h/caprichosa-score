import { matches } from '@/data/matches';
import { getFootballDataTodayAppMatches } from '@/services/footballApiService';
import type { Match } from '@/types/match';

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function getRealMatchesWithFallback(): Promise<Match[]> {
  try {
    const realMatches = await getFootballDataTodayAppMatches();

    if (realMatches.length > 0) {
      return realMatches;
    }

    return matches;
  } catch {
    return matches;
  }
}

export async function getMatches(): Promise<Match[]> {
  await wait(500);

  return getRealMatchesWithFallback();
}

export async function getMatchesByTournament(tournamentId: string): Promise<Match[]> {
  await wait(500);

  if (tournamentId === 'football-data') {
    return getRealMatchesWithFallback();
  }

  return matches.filter((match) => match.tournamentId === tournamentId);
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  await wait(500);

  const mockMatch = matches.find((match) => match.id === matchId);

  if (mockMatch) {
    return mockMatch;
  }

  try {
    const realMatches = await getFootballDataTodayAppMatches();
    const realMatch = realMatches.find((match) => match.id === matchId);

    return realMatch ?? null;
  } catch {
    return null;
  }
}