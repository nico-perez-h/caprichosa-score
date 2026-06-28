import { matches } from '@/data/matches';
import { getFootballDataTodayAppMatches } from '@/services/footballApiService';
import { getManualMatchResults } from '@/services/matchResultsService';
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

function removeApiScores(match: Match): Match {
  return {
    ...match,
    actualHomeScore: undefined,
    actualAwayScore: undefined,
  };
}

async function getRealMatchesOrNull(): Promise<Match[] | null> {
  try {
    const realMatches = await getFootballDataTodayAppMatches();

    if (realMatches.length > 0) {
      return realMatches.map(removeApiScores);
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

  return matches.map(removeApiScores);
}

async function applyManualScores(matchesList: Match[]): Promise<Match[]> {
  try {
    const manualResults = await getManualMatchResults();

    if (manualResults.length === 0) {
      return matchesList;
    }

    return matchesList.map((match) => {
      const manualResult = manualResults.find(
        (result) => result.match_id === match.id
      );

      if (!manualResult) {
        return match;
      }

      return {
        ...match,
        actualHomeScore: manualResult.home_score,
        actualAwayScore: manualResult.away_score,

        // Importante:
        // El estado viene de la API, no del resultado manual.
        status: match.status,
      };
    });
  } catch {
    return matchesList;
  }
}

async function getMatchesWithManualScores(): Promise<Match[]> {
  const allMatches = await getRealMatchesWithFallback();

  return applyManualScores(allMatches);
}

export async function getMatches(): Promise<Match[]> {
  await wait(500);

  return getMatchesWithManualScores();
}

export async function getTodayMatches(): Promise<Match[]> {
  await wait(500);

  const allMatches = await getMatchesWithManualScores();

  return getTodayMatchesFromList(allMatches);
}

export async function getPredictableMatchesOnly(): Promise<Match[]> {
  await wait(500);

  const allMatches = await getMatchesWithManualScores();

  return getPredictableMatches(allMatches);
}

export async function getTodayPredictableMatchesOnly(): Promise<Match[]> {
  await wait(500);

  const allMatches = await getMatchesWithManualScores();
  const todayMatches = getTodayMatchesFromList(allMatches);

  return getPredictableMatches(todayMatches);
}

export async function getFinishedMatches(): Promise<Match[]> {
  await wait(500);

  const allMatches = await getMatchesWithManualScores();

  return getFinishedMatchesFromList(allMatches);
}

export async function getMatchesByTournament(
  tournamentId: string
): Promise<Match[]> {
  await wait(500);

  const allMatches = await getMatchesWithManualScores();

  const tournamentMatches = allMatches.filter(
    (match) => match.tournamentId === tournamentId
  );

  if (tournamentMatches.length > 0) {
    return tournamentMatches;
  }

  const fallbackTournamentMatches = matches
    .filter((match) => match.tournamentId === tournamentId)
    .map(removeApiScores);

  return applyManualScores(fallbackTournamentMatches);
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

  const allMatches = await getMatchesWithManualScores();

  const foundMatch = allMatches.find((match) => match.id === matchId);

  return foundMatch ?? null;
}