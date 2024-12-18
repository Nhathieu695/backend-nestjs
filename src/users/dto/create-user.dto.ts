import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsEmpty, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator"
import mongoose from "mongoose";


class Company {

    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateUserDto {

    @IsNotEmpty({
        message: 'Name không được để trống',
    })
    name: string

    @IsEmail({}, {
        message: 'Email định dạng không đúng',
    })
    @IsNotEmpty({
        message: 'Email không được để trống',
    })
    email: string

    @IsNotEmpty({
        message: 'password không được để trống',
    })
    password: string

    @IsNotEmpty({
        message: 'Age không được để trống',
    })
    age: number

    @IsNotEmpty({
        message: 'Gender không được để trống',
    })
    gender: string

    @IsNotEmpty({
        message: 'address không được để trống',
    })
    address: string

    @IsNotEmpty({
        message: 'address không được để trống',
    })
    @IsMongoId({
        message: 'role có định dạng là mongoId',
    })
    role: mongoose.Schema.Types.ObjectId



    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}

export class RegisterUserDto {

    @IsNotEmpty({
        message: 'Name không được để trống',
    })
    name: string

    @IsEmail({}, {
        message: 'Email định dạng không đúng',
    })
    @IsNotEmpty({
        message: 'Email không được để trống',
    })
    email: string

    @IsNotEmpty({
        message: 'password không được để trống',
    })
    password: string

    @IsNotEmpty({
        message: 'Age không được để trống',
    })
    age: number

    @IsNotEmpty({
        message: 'Gender không được để trống',
    })
    gender: string

    @IsNotEmpty({
        message: 'address không được để trống',
    })
    address: string



}

//create-user.dto
export class UserLoginDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Thieunhathieu@gmail.com', description: 'username' })
    readonly username: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: '123456',
        description: 'password',
    })
    readonly password: string;

}

