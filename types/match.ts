export type MatchStatus = 'Por jugar' | 'En vivo' | 'Finalizado';

export type Match = {
  id: string;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  tournament: string;
  status: MatchStatus;
};