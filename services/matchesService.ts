import { matches } from '@/data/matches';
import { getFootballDataTodayAppMatches } from '@/services/footballApiService';
import type { Match } from '@/types/match';

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function getRealMatchesOrNull(): Promise<Match[] | null> {
  try {
    const realMatches = await getFootballDataTodayAppMatches();

    if (realMatches.length > 0) {
      return realMatches;
    }

    return null;
  } catch {
    return null;
  }
}

async function getRealMatchesWithFallback(): Promise<Match[]> {
  const realMatches = await getRealMatchesOrNull();

  if (realMatches) {
    return realMatches;
  }

  return matches;
}

export async function getMatches(): Promise<Match[]> {
  await wait(500);

  return getRealMatchesWithFallback();
}

export async function getMatchesByTournament(
  tournamentId: string
): Promise<Match[]> {
  await wait(500);

  const realMatches = await getRealMatchesOrNull();

  if (realMatches) {
    const realTournamentMatches = realMatches.filter(
      (match) => match.tournamentId === tournamentId
    );

    if (realTournamentMatches.length > 0) {
      return realTournamentMatches;
    }
  }

  return matches.filter((match) => match.tournamentId === tournamentId);
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  await wait(500);

  const mockMatch = matches.find((match) => match.id === matchId);

  if (mockMatch) {
    return mockMatch;
  }

  const realMatches = await getRealMatchesOrNull();

  if (!realMatches) {
    return null;
  }

  const realMatch = realMatches.find((match) => match.id === matchId);

  return realMatch ?? null;
}