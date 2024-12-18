import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator"


export class CreateSubscriberDto {
    @IsNotEmpty({
        message: 'Email không được để trống',
    })
    email: string

    @IsNotEmpty({
        message: 'Name không được để trống',
    })
    name: string

    @IsNotEmpty({
        message: 'Skills không được để trống',
    })
    @IsArray({
        message: "Skills phải là 1 mảng",
    })
    @IsString({ each: true })
    @ArrayMinSize(1, {
        message: "skills phải chứa 1 ít nhất 1 kĩ năng"
    })
    skills: string[]
}
