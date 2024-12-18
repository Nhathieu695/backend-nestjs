import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './schemas/company.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import { emit, emitWarning } from 'process';
import { IsEmail, isEmpty } from 'class-validator';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class CompaniesService {

  constructor(@InjectModel(Company.name) private CompanyModel: SoftDeleteModel<CompanyDocument>) { }
  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    let companies = await this.CompanyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return companies
  }

  async findAll(CurrentPage: number, limit: number, qs: string) {
    const { filter, skip, sort, population } = aqp(qs);
    delete filter.current,
      delete filter.pageSize

    let offset = (+CurrentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.CompanyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.CompanyModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: CurrentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return 'not found'
    return await this.CompanyModel.findOne({ _id: id });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    let UpdateCompany = await this.CompanyModel.updateOne({ _id: id }, {
      ...updateCompanyDto,
      updatedBy: {
        id: user._id,
        email: user.email
      }
    }
    )
    return UpdateCompany
  }

  async remove(id: string, user: IUser) {
    await this.CompanyModel.updateOne({
      _id: id
    },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.CompanyModel.softDelete({ _id: id })
  }
}