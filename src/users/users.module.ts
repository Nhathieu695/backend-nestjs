import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { Model } from 'mongoose';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
  { name: Role.name, schema: RoleSchema }
  ])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule { }