import { Express, NextFunction, Request, Response } from "express";
import express from 'express';
import user from './user.ts'
import { AppError } from "../error/appError.ts";

export default function (app: Express) {
    app
        .use(express.json())
        .use("/user", user)
        .use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
            let status = 500
            const response = {
                message: err.message
            }
        
            if (err instanceof AppError) {
                status = err.status
            }
        
            res.status(status).json(response)
        
            next()
        })
        
}

// senhaMaravilhosa:aSabrinaÉLindaEMaravilhosa123