import { matches } from '@/data/matches';
import { getFootballDataTodayAppMatches } from '@/services/footballApiService';
import type { Match } from '@/types/match';

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function getTodayBoliviaDate() {
  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
}

function getPredictableMatches(matchesList: Match[]) {
  return matchesList.filter((match) => match.status === 'Por jugar');
}

function getTodayMatchesFromList(matchesList: Match[]) {
  const today = getTodayBoliviaDate();

  return matchesList.filter((match) => match.date === today);
}

function getFinishedMatchesFromList(matchesList: Match[]) {
  return matchesList.filter((match) => match.status === 'Finalizado');
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

export async function getTodayMatches(): Promise<Match[]> {
  await wait(500);

  const allMatches = await getRealMatchesWithFallback();

  return getTodayMatchesFromList(allMatches);
}

export async function getPredictableMatchesOnly(): Promise<Match[]> {
  await wait(500);

  const allMatches = await getRealMatchesWithFallback();

  return getPredictableMatches(allMatches);
}

export async function getTodayPredictableMatchesOnly(): Promise<Match[]> {
  await wait(500);

  const allMatches = await getRealMatchesWithFallback();
  const todayMatches = getTodayMatchesFromList(allMatches);

  return getPredictableMatches(todayMatches);
}

export async function getFinishedMatches(): Promise<Match[]> {
  await wait(500);

  const allMatches = await getRealMatchesWithFallback();

  return getFinishedMatchesFromList(allMatches);
}

export async function getMatchesByTournament(
  tournamentId: string
): Promise<Match[]> {
  await wait(500);

  const allMatches = await getRealMatchesWithFallback();

  const tournamentMatches = allMatches.filter(
    (match) => match.tournamentId === tournamentId
  );

  if (tournamentMatches.length > 0) {
    return tournamentMatches;
  }

  return matches.filter((match) => match.tournamentId === tournamentId);
}

export async function getPredictableMatchesByTournament(
  tournamentId: string
): Promise<Match[]> {
  await wait(500);

  const tournamentMatches = await getMatchesByTournament(tournamentId);

  return getPredictableMatches(tournamentMatches);
}

export async function getTodayMatchesByTournament(
  tournamentId: string
): Promise<Match[]> {
  await wait(500);

  const tournamentMatches = await getMatchesByTournament(tournamentId);

  return getTodayMatchesFromList(tournamentMatches);
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  await wait(500);

  const realMatches = await getRealMatchesOrNull();

  if (realMatches) {
    const realMatch = realMatches.find((match) => match.id === matchId);

    if (realMatch) {
      return realMatch;
    }
  }

  const mockMatch = matches.find((match) => match.id === matchId);

  return mockMatch ?? null;
}