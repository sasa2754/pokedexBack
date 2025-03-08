import { LoginUserDto, RegisterUserDto } from "../dto/UserDto.ts";
import { prisma } from "../lib/prisma.ts";
import jwt from 'jsonwebtoken';

export class UserService {
    static register = async(data : RegisterUserDto) => {
        const name = data.name;
        const email = data.email;
        const birthday = data.birthday;
        const avatar = data.avatar;
        const password = data.password;

        if (!process.env.SECRET) {
            return false;
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
            return false;
        
        const token = jwt.sign (
            { id: user?.id },
            process.env.SECRET as string,
            {expiresIn: "1d"}
        );

        // const info = { user, token };
        return token;
    }

    static getUser = async( token : string ) => {
        try {
            if (!process.env.SECRET)
                return false;

            const decoded = jwt.verify(token, process.env.SECRET) as { id: number };

            const user = await prisma.user.findUnique({ where: { id: decoded.id } });

            if (!user)
                return false;

            return user;
        } catch (error) {
            console.log(error);
        }
    }
}