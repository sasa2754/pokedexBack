import { Express, NextFunction, Request, Response } from "express";
import express from 'express';
import user from './user.ts'
import { AppError } from "../error/appError.ts";
import pokemon from "./pokemon.ts";
import multiplayer from "./match.ts";

export default function (app: Express) {
    app
        .use(express.json())
        .use("/user", user)
        .use("/pokemon", pokemon)
        .use("/matchmaking", multiplayer)

        .use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
            let status = 500
            const response = {
                response: err.message
            }
        
            if (err instanceof AppError) {
                status = err.status
            }
        
            res.status(status).json(response)
        
            next()
        })
        
}

// senhaMaravilhosa:aSabrinaÉLindaEMaravilhosa123

// mysql://root:root@localhost:3307/pokedex