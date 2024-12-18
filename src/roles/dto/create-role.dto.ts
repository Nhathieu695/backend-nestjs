import { ArrayMinSize, IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import mongoose from "mongoose";


export class CreateRoleDto {
    @IsNotEmpty({
        message: 'Name không được để trống',
    })
    name: string

    @IsNotEmpty({
        message: 'Description không được để trống',
    })
    description: string

    @IsNotEmpty({
        message: 'isActive không được để trống',
    })
    @IsBoolean({ message: 'isActive có giá trị boolean' })
    isActive: string

    @IsNotEmpty({
        message: 'Permissions không được để trống',
    })
    @IsArray({
        message: "Permissions phải là 1 mảng",
    })
    @IsMongoId({ each: true, message: 'each permission is a mongo id' })
    permissions: mongoose.Schema.Types.ObjectId
}
