export type Group = {
  id: string;
  name: string;
  inviteCode: string;
  description: string;
  activeTournaments: number;
};

export type CreateGroupInput = {
  name: string;
  description: string;
};