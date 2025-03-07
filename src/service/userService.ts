import { RegisterUserDto } from "../dto/UserDto.ts";
import { prisma } from "../lib/prisma.ts";

export class RegisterService {
    static register = async(data : RegisterUserDto) => {
        const name = data.name;
        const email = data.email;
        const birthday = data.birthday;
        const avatar = data.avatar;
        const password = data.password;

        if (process.env.SECRET) {
            const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.SECRET);

            await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    birthday: birthday,
                    avatar: avatar,
                    password: encryptedPassword.toString()
                }
            })
        }

    }
}