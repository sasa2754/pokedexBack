import { AppError } from "../error/appError.ts";
import { Request, Response } from "express"
import jwt from "jsonwebtoken";
import { MatchService } from "../service/matchService.ts";


export class MatchController {
    static matchmaking = async (req: Request, res: Response) => {
        const token = req.headers.authorization;

        if (!token || !process.env.SECRET)
            throw new AppError("Token inválido!", 400);

        const tokenRight = token.split(" ")[1];
        const decoded = jwt.verify(tokenRight, process.env.SECRET) as { id: number };

        const result = MatchService.addToMatchmaking(decoded.id);

        if (result.matchFound) {
            res.status(200).json(result);
        } else {
            res.status(200).json({ matchFound: false });
        }
    }
}