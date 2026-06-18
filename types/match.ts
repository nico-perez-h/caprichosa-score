export type MatchStatus = 'Por jugar' | 'En vivo' | 'Finalizado';

export type Match = {
  id: string;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  kickoffTime: string;
  tournament: string;
  group: string;
  stadium: string;
  city: string;
  status: MatchStatus;
};