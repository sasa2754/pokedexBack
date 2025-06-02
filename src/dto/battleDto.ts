import { Pokemon } from "./PokemonDto.ts";

export interface BattleLog {
    message: string;
    timestamp: Date;
}

export type BattleAction = {
    type: "ATTACK" | "SWITCH" | "FLEE";
    payload?: any;
};

export interface Battle {
    matchId: string;
    player1Id: number;
    player2Id: number;
    player1Pokemon: Pokemon | null;
    player2Pokemon: Pokemon | null;
    turn: number; // id do jogador que está com a vez
    logs: BattleLog[];
    winnerId?: number;
}