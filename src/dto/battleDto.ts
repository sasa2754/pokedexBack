import { Pokemon } from "./PokemonDto.ts";

export interface Battle {
  matchId: string;
  player1Id: number;
  player2Id: number;
  player1Pokemon: Pokemon | null;
  player2Pokemon: Pokemon | null;
  turn: number; // id do jogador que está com a vez
  logs: string[];
  winnerId?: number;
}
