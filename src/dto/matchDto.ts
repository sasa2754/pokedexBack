export interface WaitingPlayer {
  userId: number;
};

export interface Match {
  matchId: string;
  players: [number, number];
};