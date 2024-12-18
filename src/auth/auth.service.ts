import { BadRequestException, Injectable, Res } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { CreateUserDto, RegisterUserDto } from 'src/users/dto/create-user.dto';
import { genSaltSync, hashSync } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';


@Injectable()
export class AuthService {

    constructor(private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private roleService: RolesService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid === true) {
                const userRole = user.role as unknown as { _id: string; name: string }
                const temp = await this.roleService.findOne(userRole._id);

                const objUser = {
                    ...user.toObject(),
                    permissions: temp?.permissions ?? []
                }

                return objUser;
            }
        }

        return null;
    }


    async login(user: IUser, response: Response) {
        const { _id, name, email, role, permissions } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };
        const refresh_token = this.createRefreshToken(payload)


        await this.usersService.UpdateUserToken(refresh_token, _id)

        //set cookies
        response.cookie('Refresh_Token', refresh_token,
            {
                httpOnly: true,
                maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))
            }
        )
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role,
                permissions
            }

        };
    }

    async create(registerUserDto: RegisterUserDto) {
        let Newuser = await this.usersService.register(registerUserDto)
        return {
            _id: Newuser?._id,
            createdAt: Newuser?.createdAt
        }
    }

    createRefreshToken = (payload: any) => {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) / 1000
        })
        return refresh_token
    }

    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            })
            let userToken = await this.usersService.findUserByToken(refreshToken)
            if (userToken) {
                const { _id, name, email, role } = userToken;
                const payload = {
                    sub: "token refresh",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role

                };
                const refresh_token = this.createRefreshToken(payload)

                await this.usersService.UpdateUserToken(refresh_token, _id.toString())

                //fetch user's role
                const userRole = userToken.role as unknown as { _id: string; name: string }
                const temp = await this.roleService.findOne(userRole._id)


                response.clearCookie('Refresh_Token');
                //set cookies
                response.cookie('Refresh_Token', refresh_token,
                    {
                        httpOnly: true,
                        maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE"))
                    }
                )
                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role,
                        permissions: temp?.permissions ?? []
                    }

                };
            } else {
                throw new BadRequestException(`Refresh Token đã hết hạn hoặc không hơp lệ. Vui lòng login lại`)
            }

        } catch (error) {
            throw new BadRequestException(`Refresh Token đã hết hạn hoặc không hơp lệ. Vui lòng login lại`)

        }
    }


    loggout = async (response: Response, user: IUser) => {
        const { _id } = user
        await this.usersService.UpdateUserToken("", _id)
        response.clearCookie('Refresh_Token')
        return 'ok'
    }
}
