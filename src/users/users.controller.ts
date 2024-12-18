import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/auth/decorator/customize';
import { IUser } from './users.interface';
import { ApiTags } from '@nestjs/swagger';


@ApiTags("users")
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage("Create a new user")
  create(
    @Body() createUserDto: CreateUserDto, @User() user: IUser
  ) {
    return this.usersService.create(createUserDto, user)
  }

  @Get()
  @ResponseMessage("fetch user with paginate")
  findAll(@Query("current") CurrentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string) {
    return this.usersService.findAll(+CurrentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage("fetch user by id")
  findOne(@Param('id') id: string) {

    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update a user")
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a user")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
