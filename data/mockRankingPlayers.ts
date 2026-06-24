export type RankingPlayer = {
  id: string;
  name: string;
  points: number;
  predictions: number;
  accuracy: number;
  isCurrentUser?: boolean;
};

export const mockRankingPlayers: RankingPlayer[] = [
  {
    id: 'friend-1',
    name: 'Diego',
    points: 12,
    predictions: 8,
    accuracy: 63,
  },
  {
    id: 'friend-2',
    name: 'Mateo',
    points: 8,
    predictions: 7,
    accuracy: 43,
  },
  {
    id: 'friend-3',
    name: 'Santi',
    points: 5,
    predictions: 6,
    accuracy: 33,
  },
  {
    id: 'friend-4',
    name: 'Leo',
    points: 3,
    predictions: 4,
    accuracy: 25,
  },
];