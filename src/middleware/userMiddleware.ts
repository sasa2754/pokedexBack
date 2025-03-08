import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.ts";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { AppError } from "../error/appError.ts";

export class userMiddleware {
    static validateRegister =  async (req : Request, res : Response,  next: NextFunction) => {
       
       const { name, email, password, birthday, avatar } = req.body;
    
       if (!name || !email || !password || !birthday || !avatar)
          throw new AppError("Campos em branco!", 400)

       if (!process.env.SECRET)
         throw new Error("Server Error!")
    
       const userExists = await prisma.user.findUnique({where :  {email : email}});
    
       if(userExists)
          throw new AppError("Usuário já cadastrado!", 400)
    
       next(); 
    };
    
    
    static validateLogin = async (req: Request, res: Response, next: NextFunction) => {
          const { email, password } = req.body;
     
          if (!email || !password) {
               res.status(400).send("Campos em branco!");
               return;
          }
          
          if (!process.env.SECRET)  {
               res.status(500).send("Erro interno!");
               return;
          }
     
          const userExists = await prisma.user.findUnique({where :  {email : email}});
     
          console.log(userExists)
          if (!userExists) {
               res.status(404).send("Usuário não encontrado!");
               return;
          }
          
          const bytes = CryptoJS.AES.decrypt(userExists.password, process.env.SECRET);
          const decryptPass = bytes.toString(CryptoJS.enc.Utf8);
     
          if (decryptPass != password) {
               res.status(401).send("Senha incorreta!");
               return;
          }
     
          next();
    }
    
    static getUserMid = async (req: Request, res: Response, next: NextFunction) => {
       try {
           const authHeader = req.headers.authorization;
       
           if (!authHeader) {
               res.status(400).send("Token não fornecido!");
                return;
           }
       
           const token = authHeader.split(" ")[1];
       
           if (!process.env.SECRET) {
                res.status(500).send("Erro interno!");
                return;
           }
       
           const decoded = jwt.verify(token, process.env.SECRET) as { id: number };
       
           const user = await prisma.user.findUnique({ where: { id: decoded.id } });
       
           if (!user) {
               res.status(404).json({ error: "Usuário não encontrado" });
               return;
           }
       
           (req as any).user = user;
    
           next();
    
       } catch (error) {
           res.status(401).json({ error: "Token inválido ou expirado.", details: error });
           return;
       }
    }

}
