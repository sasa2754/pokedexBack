import { Request, Response } from "express"
import { LoginUserDto, RegisterUserDto, UserDto } from "../dto/UserDto.ts";
import { UserService } from "../service/userService.ts";

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
}