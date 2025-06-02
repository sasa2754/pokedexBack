import { Request, Response } from "express";
import { BattleService } from "../service/battleService.ts";
import { AppError } from "../error/appError.ts";
import { BattleAction } from "../dto/battleDto.ts";


export class BattleController {
    static selectPokemon = async (req: Request, res: Response) => {
        const token = req.headers.authorization;

        if (!token)
            throw new AppError("Token não recebido!", 400);
        
        try {
            const { matchId, pokemonId } = req.body;
            
            const battle = await BattleService.selectPokemon(token, matchId, pokemonId);
            res.status(200).json(battle);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Erro interno do servidor" });
            }
        }
    }

    static performAction = async (req: Request, res: Response) => {
        const token = req.headers.authorization;

        if (!token)
            throw new AppError("Token não recebido!", 400);

        try {
            const { matchId, action } = req.body;
            
            const battle = await BattleService.performAction(token, matchId, action);
            res.status(200).json(battle);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Erro interno do servidor" });
            }
        }
    }

    static getBattleStatus = async (req: Request, res: Response) => {
        try {
            const { matchId } = req.params;
            const battle = BattleService.getBattle(matchId);
            
            if (!battle) {
                throw new AppError("Batalha não encontrada", 404);
            }
            
            res.status(200).json(battle);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Erro interno do servidor" });
            }
        }
    }

    static surrender = async (req: Request, res: Response) => {
        const token = req.headers.authorization;

        if (!token)
            throw new AppError("Token não recebido!", 400);

        try {
            const { matchId } = req.body;
            
            const battle = await BattleService.performAction(token, matchId, { type: "FLEE" });
            res.status(200).json(battle);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Erro interno do servidor" });
            }
        }
    }
}