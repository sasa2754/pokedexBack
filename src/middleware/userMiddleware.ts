import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.ts";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { AppError } from "../error/appError.ts";

export class userMiddleware {
    static validateRegister =  async (req : Request, res : Response,  next: NextFunction) => {
       
       const { name, email, password, birthday, avatar } = req.body;
    
       if (!name || !email || !password || !birthday || !avatar)
          throw new AppError("Campos em branco!", 400);

       if (!process.env.SECRET)
         throw new Error("Server Error!");
    
       const userExists = await prisma.user.findUnique({where :  {email : email}});
    
       if(userExists)
          throw new AppError("Usuário já cadastrado!", 400);
    
       next(); 
    };
    
    
    static validateLogin = async (req: Request, res: Response, next: NextFunction) => {
          const { email, password } = req.body;
     
          if (!email || !password)
               throw new AppError("Campos em branco!", 400);

          
          if (!process.env.SECRET)
               throw new Error("Server Error!");
     
          const userExists = await prisma.user.findUnique({where :  {email : email}});
     
          console.log(userExists)
          if (!userExists)
               throw new AppError("Usuário não encontrado!", 404);

          
          const bytes = CryptoJS.AES.decrypt(userExists.password, process.env.SECRET);
          const decryptPass = bytes.toString(CryptoJS.enc.Utf8);
     
          if (decryptPass != password)
               throw new AppError("Senha incorreta!", 400);

          next();
    }
    
    static getUserMid = async (req: Request, res: Response, next: NextFunction) => {
       try {
           const authHeader = req.headers.authorization;
       
           if (!authHeader)
               throw new AppError("Token não fornecido!", 401);

       
           const token = authHeader.split(" ")[1];
       
           if (!process.env.SECRET)
               throw new Error("Internal Server Error!");

       
           const decoded = jwt.verify(token, process.env.SECRET) as { id: number };
       
           const user = await prisma.user.findUnique({ where: { id: decoded.id } });
       
           if (!user)
               throw new AppError("Usuário não encontrado!", 404);

       
           (req as any).user = user;
    
           next();
    
       } catch (error) {
          throw new AppError("Token expirado!", 401);
       }
    }
}
