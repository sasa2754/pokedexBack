import { Battle, BattleAction, BattleLog } from "../dto/battleDto.ts";
import { MatchService } from "./matchService.ts";
import { PokemonService } from "./pokemonService.ts";
import { prisma } from "../lib/prisma.ts";
import { AppError } from "../error/appError.ts";
import { Pokemon } from "../dto/PokemonDto.ts";
import jwt from 'jsonwebtoken';


const battles: Battle[] = [];

export class BattleService {
    static async selectPokemon(token: string, matchId: string, pokemonId: number) {
        if (!process.env.SECRET)
            throw new Error("Internal Server Error!");

        // Decodificando o token para obter o id do usuário
        const tokenRight = token.split(" ")[1];
        const decoded = jwt.verify(tokenRight, process.env.SECRET) as { id: number };
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) throw new AppError("Usuário não encontrado!", 404);

        const match = MatchService.getMatchForUser(user.id);
        if (!match || match.matchId !== matchId) {
            throw new AppError("Partida não encontrada ou você não está nela!", 404);
        }

        // Verificar se o Pokémon pertence ao usuário
        const userPokemon = await prisma.pokedex.findFirst({
            where: {
                userId: user.id,
                pokemonId: pokemonId
            },
            include: {
                pokemon: true
            }
        });

        if (!userPokemon) {
            throw new AppError("Você não possui este Pokémon!", 400);
        }

        let battle = battles.find(b => b.matchId === matchId);
        if (!battle) {
            battle = {
                matchId,
                player1Id: match.players[0].id,
                player2Id: match.players[1].id,
                player1Pokemon: null,
                player2Pokemon: null,
                turn: match.players[Math.floor(Math.random() * 2)].id,
                logs: [],
                winnerId: undefined
            };
            battles.push(battle);
        }

        const pokemon = userPokemon.pokemon;

        if (user.id === battle.player1Id) {
            battle.player1Pokemon = pokemon;
        } else if (user.id === battle.player2Id) {
            battle.player2Pokemon = pokemon;
        }

        // Verificar se ambos selecionaram Pokémon para começar a batalha
        if (battle.player1Pokemon && battle.player2Pokemon) {
            this.addLog(battle, "A batalha começou!");
            this.addLog(battle, `${battle.player1Pokemon.name} vs ${battle.player2Pokemon.name}`);
        }

        return battle;
    }

    static async performAction(token: string, matchId: string, action: BattleAction) {
        if (!process.env.SECRET)
          throw new Error("Internal Server Error!");

        // Decodificando o token para obter o id do usuário
        const tokenRight = token.split(" ")[1];
        const decoded = jwt.verify(tokenRight, process.env.SECRET) as { id: number };
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) throw new AppError("Usuário não encontrado!", 404);

        const match = MatchService.getMatchForUser(user.id);

        if (!match || match.matchId !== matchId) {
            throw new AppError("Partida não encontrada ou você não está nela!", 404);
        }
        const battle = battles.find(b => b.matchId === matchId);
        if (!battle) {
            throw new AppError("Batalha não encontrada!", 404);
        }

        if (battle.turn !== user.id) {
            throw new AppError("Não é seu turno!", 400);
        }

        if (!battle.player1Pokemon || !battle.player2Pokemon) {
            throw new AppError("Ambos os jogadores precisam selecionar um Pokémon!", 400);
        }

        const attackerPokemon = user.id === battle.player1Id ? battle.player1Pokemon : battle.player2Pokemon;
        const defenderPokemon = user.id === battle.player1Id ? battle.player2Pokemon : battle.player1Pokemon;

        switch (action.type) {
            case "ATTACK":
                this.handleAttack(battle, attackerPokemon, defenderPokemon);
                break;
            case "SWITCH":
                // Implementar troca de Pokémon
                break;
            case "FLEE":
                this.handleFlee(battle, user.id);
                break;
            default:
                throw new AppError("Ação inválida!", 400);
        }

        // Verificar se a batalha terminou
        this.checkBattleEnd(battle);

        // Alternar turno se a batalha não terminou
        if (!battle.winnerId) {
            battle.turn = user.id === battle.player1Id ? battle.player2Id : battle.player1Id;
            this.addLog(battle, `Turno de ${battle.turn === battle.player1Id ? "Jogador 1" : "Jogador 2"}`);
        }

        return battle;
    }

    private static handleAttack(battle: Battle, attacker: Pokemon, defender: Pokemon) {
        const damage = this.calculateDamage(attacker, defender);
        
        defender.hp -= damage;
        defender.hp = Math.max(0, defender.hp); // Garantir que HP não fique negativo

        this.addLog(battle, `${attacker.name} atacou ${defender.name} causando ${damage} de dano!`);

        if (defender.hp <= 0) {
            this.addLog(battle, `${defender.name} desmaiou!`);
        }
    }

    private static calculateDamage(attacker: Pokemon, defender: Pokemon): number {
        // Fórmula simplificada de dano
        const attackPower = attacker.attack;
        const defensePower = defender.defense;
        const randomFactor = 0.85 + Math.random() * 0.15; // Entre 85% e 100%
        
        let damage = (attackPower * attackPower) / (attackPower + defensePower);
        damage *= randomFactor;
        
        return Math.floor(damage);
    }

    private static handleFlee(battle: Battle, userId: number) {
        battle.winnerId = userId === battle.player1Id ? battle.player2Id : battle.player1Id;
        this.addLog(battle, `${userId === battle.player1Id ? "Jogador 1" : "Jogador 2"} fugiu da batalha!`);
    }

    private static checkBattleEnd(battle: Battle) {
        if (!battle.player1Pokemon || battle.player1Pokemon.hp <= 0) {
            battle.winnerId = battle.player2Id;
            this.addLog(battle, "Jogador 2 venceu a batalha!");
        } else if (!battle.player2Pokemon || battle.player2Pokemon.hp <= 0) {
            battle.winnerId = battle.player1Id;
            this.addLog(battle, "Jogador 1 venceu a batalha!");
        }

        if (battle.winnerId) {
            this.distributeRewards(battle);
            // this.cleanupBattle(battle.matchId);
            MatchService.cleanUpMatch(battle.matchId)
        }
    }

    private static async distributeRewards(battle: Battle) {
        if (!battle.winnerId) return;

        try {
            const winner = await prisma.user.findUnique({ where: { id: battle.winnerId } });
            if (!winner) return;

            // Calcular recompensa baseada nos Pokémon
            const pokemon1 = battle.player1Pokemon!;
            const pokemon2 = battle.player2Pokemon!;
            const reward = Math.floor((pokemon1.base_experience + pokemon2.base_experience) / 10);

            await prisma.user.update({
                where: { id: battle.winnerId },
                data: { money: { increment: reward } }
            });

            this.addLog(battle, `Jogador ${battle.winnerId} ganhou ${reward} moedas por vencer a batalha!`);
        } catch (error) {
            console.error("Erro ao distribuir recompensas:", error);
        }
    }

    private static cleanupBattle(matchId: string) {
        const index = battles.findIndex(b => b.matchId === matchId);
        if (index !== -1) {
            battles.splice(index, 1);
        }
    }

    public static cleanupBattleByUser(userId: number) {
        const userIdString = userId.toString();
        const index = battles.findIndex(b => {
            const [id1, id2] = b.matchId.split('-')
            if (id1 === userIdString || id2 === userIdString)
                return true
            return false
        });

        if (index !== -1) {
            battles.splice(index, 1);
        }
    }

    private static addLog(battle: Battle, message: string) {
        battle.logs.push({
            message,
            timestamp: new Date()
        });
    }

    static getBattle(matchId: string): Battle | undefined {
        return battles.find(b => b.matchId === matchId);
    }

    static createBattle(matchId: string, player1Id: number, player2Id: number) {
        const battle = {
            matchId,
            player1Id,
            player2Id,
            player1Pokemon: null,
            player2Pokemon: null,
            turn: [player1Id, player2Id][Math.floor(Math.random() * 2)],
            logs: [],
            winnerId: undefined
        };
        battles.push(battle);
    }
}