import { Match, WaitingPlayer } from "../dto/matchDto.ts";
import { AppError } from "../error/appError.ts";
import { prisma } from "../lib/prisma.ts";


const waitingList: WaitingPlayer[] = [];
const matches: Match[] = [];

export class MatchService {
    static async addToMatchmaking(userId : number) {

        const userName = (await prisma.user.findFirst({where: {id: userId}}))?.name

        console.log(waitingList)

        if (!userName)
            throw new AppError("User not found!", 404)

        // jogador já tem uma partida ativa, retorna ela
        if (matches.find(m => m.players.map(x => x.id).includes(userId))) {
            return { matchFound: true, match: this.getMatchForUser(userId)! };
        }

        if (!waitingList.some(p => p.userId === userId)) {
            waitingList.push({ userId, name: userName });
        }

        if (waitingList.length >= 2) {
            const player1 = waitingList.shift()!;
            const player2 = waitingList.shift()!;
            
            const matchId = `${player1.userId}-${player2.userId}`;

            const match: Match = {
                matchId,
                  players: [
                    { id: player1.userId, name: player1.name },
                    { id: player2.userId, name: player2.name }
                ],
            };

            matches.push(match);

            return { matchFound: true, match };
        }

        return { matchFound: false };
    }

    static getMatchForUser(userId: number) {
        return matches.find(m => m.players.map(x=>x.id).includes(userId));
    }
}