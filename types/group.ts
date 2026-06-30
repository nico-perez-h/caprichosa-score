export type Group = {
  id: string;
  name: string;
  inviteCode: string;
  description: string;
  activeTournaments: number;
  predictionLockMinutes: number | null;
};

export type CreateGroupInput = {
  name: string;
  description: string;
};