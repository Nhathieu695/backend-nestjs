import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDate, IsEmpty, IsISO8601, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator"
import mongoose from "mongoose";


class Company {

    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}

export class CreateJobDto {

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

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({
        message: 'Location không được để trống',
    })
    location: string

    @IsNotEmpty({
        message: 'Salary không được để trống',
    })
    salary: number

    @IsNotEmpty({
        message: 'Quantity không được để trống',
    })
    quantity: number

    @IsNotEmpty({
        message: 'Level không được để trống',
    })
    level: string

    @IsNotEmpty({
        message: 'Description không được để trống',
    })
    description: string

    @IsNotEmpty({
        message: 'StartDate không được để trống',
    })
    @Type(() => Date)
    @IsDate({ message: 'Ngày phải đúng định dạng và là một giá trị hợp lệ!' })
    startDate: Date

    @IsNotEmpty({
        message: 'EndDate không được để trống',
    })

    @Type(() => Date)
    @IsDate({ message: 'Ngày phải đúng định dạng và là một giá trị hợp lệ!' })
    endDate: Date
    @IsNotEmpty({
        message: 'EndDate không được để trống',
    })
    isActive: boolean
}
