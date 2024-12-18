import { Controller, Get, Post, Render, UseGuards, Req, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from './decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { CreateUserDto, RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { Response, Request } from 'express';
import { RolesService } from 'src/roles/roles.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags("auth")
@Controller("auth")
export class AuthController {

    constructor(
        private authService: AuthService,
        private roleService: RolesService
    ) { }


    @Public()
    @UseGuards(LocalAuthGuard)
    @UseGuards(ThrottlerGuard)
    @ResponseMessage("User login")
    @Throttle(3, 6000)
    @ApiBody({ type: UserLoginDto, })
    @Post('/login')
    handleLogin(@Req() req,
        @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response)
    }

    @Public()
    @Post("/register")
    @ResponseMessage("Register a new user")
    handleRegister(
        @Body() registerUserDto: RegisterUserDto
    ) {
        return this.authService.create(registerUserDto)
    }

    @ResponseMessage("get user information")
    @Get('/account')
    async handleAccount(@User() user: IUser) {
        const temp = await this.roleService.findOne(user.role._id) as any
        user.permissions = temp.permissions
        return { user }
    }

    @Public()
    @ResponseMessage("get user by refresh token")
    @Get('/refresh')
    handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies['Refresh_Token']

        return this.authService.processNewToken(refreshToken, response)
    }

    @ResponseMessage("Loggout User")
    @Post('/logout')
    handdleLoggout(@Res({ passthrough: true }) response: Response, @User() user: IUser) {
        return this.authService.loggout(response, user)
    }
}
