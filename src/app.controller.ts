import { Controller, Get, Post, Render, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './auth/decorator/customize';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly configService: ConfigService,
    private authService: AuthService
  ) { }

  // @Get()
  // @Render("Home")
  // getHello() {
  //   console.log("check port", this.configService.get<string>("PORT"))
  //   const message = this.appService.getHello()
  //   return {
  //     message: message
  //   };
  // }
}
