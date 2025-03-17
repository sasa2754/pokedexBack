import { LoginUserDto, RegisterUserDto } from "../dto/UserDto.ts";
import { prisma } from "../lib/prisma.ts";
import jwt from 'jsonwebtoken';
import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import { AppError } from "../error/appError.ts";
import fs from "fs/promises";

import path from "path";
import { fileURLToPath } from "url";
import { Pokeball } from "../dto/PokeballDto.ts";

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
                password: encryptedPassword,
                money: 10
            }
        });

        const user = await prisma.user.findFirst({ where: { email: email } });
        const pokeballs = await prisma.pokeball.findMany();

        if (!user)
            throw new Error("Falha ao criar conta!");

        const pokeball = await prisma.pokeball.findFirst({ where: { name: "Pokeball" } });

        if (!pokeball) {
            throw new Error("Pokébola Normal não encontrada!");
        }

        await prisma.userPokeball.create({
            data: {
                userId: user.id,
                pokeballId: pokeball.id,
                amount: 10
            },
        });
        
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

            const tokenRight = token.split(" ")[1];

            const decoded = jwt.verify(tokenRight, process.env.SECRET) as { id: number };

            const user = await prisma.user.findUnique({ where: { id: decoded.id } });

            if (!user)
                throw new AppError("Usuário não encontrado!", 404);

            const pokedex = await prisma.pokedex.findMany({
                where: { userId: user.id },
                include: { 
                    pokemon: true 
                }
            });

            const userPokeballs = await prisma.userPokeball.findMany({
                where: { userId: user.id },
                include: { pokeball: true }
            });

            const pokeballsCount = userPokeballs.reduce((acc, userPokeball) => {
                const pokeballName = userPokeball.pokeball.name;
                const amount = userPokeball.amount;

                if (!acc[pokeballName]) {
                    acc[pokeballName] = 0;
                }
                acc[pokeballName] += amount;

                return acc;
            }, {} as Record<string, number>);

            const pokeballs = {
                pokeball: pokeballsCount["Pokeball"] || 0,
                greatball: pokeballsCount["Greatball"] || 0,
                ultraball: pokeballsCount["Ultraball"] || 0,
                masterball: pokeballsCount["Masterball"] || 0,
            };

            const response = {
                name: user.name,
                email: user.email,
                birthday: user.birthday,
                avatar: user.avatar,
                money: user.money,
                pokeballs: pokeballs,
                pokedex: pokedex.map(item => ({
                    ...item.pokemon,
                    id: item.pokemon.id,
                    name: item.pokemon.name,
                    base_experience: item.pokemon.base_experience,
                    hp: item.pokemon.hp,
                    attack: item.pokemon.attack,
                    defense: item.pokemon.defense,
                    speed: item.pokemon.speed,
                    image: item.pokemon.image,
                    imageShiny: item.pokemon.imageShiny,
                    isShiny: item.pokemon.isShiny,
                    crie: item.pokemon.crie,
                }))
            };

            return response;

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

            return avatarList;
        } catch (error) {
            console.error("Erro ao ler a pasta de avatares:", error);
            throw new Error("Internal Server Error!");
        }
    }

    static buyPokeball = async (pokeball: Pokeball, token: string) => {
        try {
            if (!process.env.SECRET)
                throw new Error("Internal Server Error!");

            const tokenRight = token.split(" ")[1];

            const decoded = jwt.verify(tokenRight, process.env.SECRET) as { id: number };

            const user = await prisma.user.findUnique({ where: { id: decoded.id } });

            if (!user)
                throw new AppError("Usuário não encontrado!", 404);

            if (user.money < pokeball.price)
                throw new AppError("Dinheiro insuficiente!", 400);

            const userPokeball = await prisma.userPokeball.findFirst({
                where: {
                    userId: user.id,
                    pokeballId: pokeball.id,
                },
            });

            if (userPokeball) {
                await prisma.userPokeball.update({
                    where: { id: userPokeball.id },
                    data: {
                        amount: {
                            increment: 1,
                        },
                    },
                });
            } else {
                await prisma.userPokeball.create({
                    data: {
                        userId: user.id,
                        pokeballId: pokeball.id,
                        amount: 1,
                    },
                });
            }

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    money: user.money - pokeball.price
                }
            })

        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}