import { Match, WaitingPlayer } from "../dto/matchDto.ts";


const waitingList: WaitingPlayer[] = [];
const matches: Match[] = [];

export class MatchService {
    static addToMatchmaking(userId : number) {

        // jogador já tem uma partida ativa, retorna ela
        if (matches.find(m => m.players.includes(userId))) {
            return { matchFound: true, match: this.getMatchForUser(userId)! };
        }

        if (!waitingList.some(p => p.userId === userId)) {
            waitingList.push({ userId });
        }

        if (waitingList.length >= 2) {
            const player1 = waitingList.shift()!;
            const player2 = waitingList.shift()!;
            
            const matchId = `${player1.userId}-${player2.userId}`;

            const match: Match = {
                matchId,
                players: [player1.userId, player2.userId],
            };

            matches.push(match);

            return { matchFound: true, match };
        }

        return { matchFound: false };
    }

    static getMatchForUser(userId: number) {
        return matches.find(m => m.players.includes(userId));
    }
}