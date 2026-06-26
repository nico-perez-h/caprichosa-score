export type MatchStatus = 'Por jugar' | 'En vivo' | 'Finalizado';

export type Match = {
  id: string;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamFlag?: string;
  awayTeamFlag?: string;
  homeTeamCode?: string;
  awayTeamCode?: string;
  date: string;
  kickoffTime: string;
  tournament: string;
  group: string;
  stadium: string;
  city: string;
  status: MatchStatus;
  actualHomeScore?: number;
  actualAwayScore?: number;
};