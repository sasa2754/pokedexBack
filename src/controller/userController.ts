import { Request, Response } from "express"
import { prisma } from '../lib/prisma.ts'
import jwt from 'jsonwebtoken'
import CryptoJS from "crypto-js";
import { UserDto } from "../dto/UserDto.ts";

export class UserController {
    static getUser = async (req : Request, res : Response) => {
        const user = (req as any).user;

        if (!user) {
            res.status(500).send("Erro ao buscar usuário!");
            return;
        }

        res.status(200).send(user);
        return;
    }

    static registerUser = async (req: Request, res: Response) => {

    }

    static loginUser = async (req: Request, res: Response) => {
        // Enviar o token pela header
    }
}