import { matches } from '@/data/matches';
import type { Match } from '@/types/match';

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function getMatches(): Promise<Match[]> {
  await wait(500);

  return matches;
}

export async function getMatchesByTournament(tournamentId: string): Promise<Match[]> {
  await wait(500);

  return matches.filter((match) => match.tournamentId === tournamentId);
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  await wait(500);

  const foundMatch = matches.find((match) => match.id === matchId);

  return foundMatch ?? null;
}