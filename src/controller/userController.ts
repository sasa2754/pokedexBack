import { Request, Response } from "express"
import { LoginUserDto, RegisterUserDto, UserDto } from "../dto/UserDto.ts";
import { UserService } from "../service/userService.ts";
import { AppError } from "../error/appError.ts";
import { prisma } from "../lib/prisma.ts";

export class UserController {
    static getUser = async (req : Request, res : Response) => {
        const token = req.headers.authorization;

        if (!token)
            throw new AppError("Token não recebido!", 400);

        const user = await UserService.getUser(token);

        if (!user) {
            res.status(500).send("Erro ao buscar usuário!");
            return;
        }

        res.status(200).send(user);
        return;
    }

    static registerUser = async (req: Request, res: Response) => {
        const data : RegisterUserDto = req.body;
        
        const response = await UserService.register(data);
        console.log("Ta aqui")

        if (!response) {
            res.status(500).send("Erro interno!");
            return;
        }

        res.status(200).send("Usuário criado com sucesso!")
        return;
    }

    static loginUser = async (req: Request, res: Response) => {
        const data : LoginUserDto = req.body;

        const response = await UserService.login(data);

        if (!response) {
            res.status(404).send("Usuário não encontrado!");
            return;
        }

        res.set("Authorization", `Bearer ${response}`)
        res.status(200).send("Login feito com sucesso!")
    }

    static getAvatar = async (req: Request, res: Response) => {

        try {
            const avatarList = await UserService.sendAvatar();

            console.log(avatarList);
    
            res.status(200).json(avatarList);
        } catch {
            throw new Error("Erro ao pegar as imagens!");
        }
    }


    static buyPokeball = async (req: Request, res: Response) => {
        const { pokeballName } = req.body;
        const token = req.headers.authorization;

        if (!pokeballName)
            throw new AppError("Campos nulos!", 400);

        if (!token)
            throw new AppError("Token não recebido!", 400);

        const pokeball = await prisma.pokeball.findFirst({
            where: { name: pokeballName }
        });

        if (!pokeball)
            throw new AppError("Pokeball não encontrado!", 404);

        console.log(pokeball);

        try {
            await UserService.buyPokeball(pokeball, token);
            res.status(200).send("Compra bem sucedida!")

        } catch (error) {
            if (error instanceof AppError && error.message === "Dinheiro insuficiente!") {
                res.status(400).json({ response: error.message });
            } else {
                res.status(500).json({ response: "Internal Server Error!" });
            }
        }
    }



    // Talvez fazer o negócio de enviar as imagens das pokeballs, mas só talvez, se for mt empenho, eu só pego direto do front mesmo e fodasse
}