export interface WaitingPlayer {
  userId: number;
  name: string;
};

export interface Match {
  matchId: string;
  players: {id: number, name: string}[];
};