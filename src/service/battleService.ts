import { Battle } from "../dto/battleDto.ts";
import { MatchService } from "./matchService.ts";
import { getPokemonById } from "./pokemonService.ts"; // você precisa ter essa função

const battles: Battle[] = [];

export class BattleService {
  static selectPokemon(userId: number, matchId: string, pokemonId: number) {
    const match = MatchService.getMatchForUser(userId);
    if (!match || match.matchId !== matchId) return null;

    let battle = battles.find(b => b.matchId === matchId);
    if (!battle) {
      battle = {
        matchId,
        player1Id: match.players[0],
        player2Id: match.players[1],
        player1Pokemon: null,
        player2Pokemon: null,
        turn: match.players[Math.floor(Math.random() * 2)],
        logs: []
      };
      battles.push(battle);
    }

    const pokemon = getPokemonById(pokemonId); // função fictícia que você precisa implementar

    if (userId === battle.player1Id) {
      battle.player1Pokemon = pokemon;
    } else if (userId === battle.player2Id) {
      battle.player2Pokemon = pokemon;
    }

    return battle;
  }
}
