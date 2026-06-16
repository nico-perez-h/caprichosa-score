export type TournamentStatus = 'Disponible' | 'Próximamente';

export type Tournament = {
  id: string;
  name: string;
  description: string;
  status: TournamentStatus;
};