import { LoginUserDto, RegisterUserDto } from "../dto/UserDto.ts";
import { prisma } from "../lib/prisma.ts";
import jwt from 'jsonwebtoken';
import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import { AppError } from "../error/appError.ts";
import fs from "fs/promises";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export class UserService {
    static register = async(data : RegisterUserDto) => {
        const name = data.name;
        const email = data.email;
        const birthday = data.birthday;
        const avatar = data.avatar;
        const password = data.password;
        
        if (!process.env.SECRET) {
            throw new Error("Internal Server Error!")
        }
        
        const idade = dayjs().diff(dayjs(birthday), "year");
        
        if (idade < 10) {
            throw new AppError("Usuário deve ter pelo menos 10 anos para se cadastrar.", 401);
        }
        
        
        const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.SECRET).toString();
        
        await prisma.user.create({
            data: {
                name: name,
                email: email,
                birthday: birthday,
                avatar: avatar,
                password: encryptedPassword
            }
        })
        

        return true;
    }

    static login = async(data : LoginUserDto) => {
        const email = data.email;
        const user = await prisma.user.findUnique({ where:  {email : email}});

        if (!user)
            throw new AppError("Usuário não encontrado!", 404);

        
        const token = jwt.sign (
            { id: user?.id },
            process.env.SECRET as string,
            {expiresIn: "1d"}
        );

        const info = { user, token };
        console.log(info)
        return token;
    }

    static getUser = async( token : string ) => {
        try {
            if (!process.env.SECRET)
                throw new Error("Internal Server Error!");


            const decoded = jwt.verify(token, process.env.SECRET) as { id: number };

            const user = await prisma.user.findUnique({ where: { id: decoded.id } });

            if (!user)
                throw new AppError("Usuário não encontrado!", 404);

            return user;
        } catch (error) {
            console.log(error);
            throw new Error("Internal Server Error!");
        }
    }

    static sendAvatar = async () => {
        try {
            const avatarPath = path.join(__dirname, "../../images/avatar");

            const files = await fs.readdir(avatarPath);

            const avatarList = files.map(file => ({
                name: file,
                url: `/images/avatar/${file}`,
            }));

            // console.log(avatarList);

            return avatarList;
        } catch (error) {
            console.error("Erro ao ler a pasta de avatares:", error);
            throw new Error("Internal Server Error!");
        }
    };
}