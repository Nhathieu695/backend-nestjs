import { Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.shema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { strict } from 'assert';

@Injectable()
export class ResumesService {

  constructor(@InjectModel(Resume.name) private ResumeModel: SoftDeleteModel<ResumeDocument>) { }
  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    let resume = await this.ResumeModel.create({
      email: user.email,
      userId: user._id,
      status: "PENDING",
      history: [{
        status: "PENDING",
        updateAt: new Date,
        updateBy: {
          _id: user._id,
          email: user.email
        }
      }
      ], ...createUserCvDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }

    })
    return {
      _id: resume._id,
      createAt: resume.createdAt
    };
  }

  async findAll(CurrentPage: number, limit: number, qs: string) {
    const { filter, skip, sort, population, projection } = aqp(qs);
    delete filter.current,
      delete filter.pageSize

    let offset = (+CurrentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.ResumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.ResumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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

  async find(user: IUser) {
    return await this.ResumeModel.find({ userId: user._id }).sort("-createdAt").populate([{
      path: "companyId",
      select: { name: 1 }
    },
    {
      path: "jobId",
      select: { name: 1 }
    }])
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return 'not found'
    return await this.ResumeModel.findById(id)
  }

  async update(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return 'not found'
    let updateResume = await this.ResumeModel.updateOne({ _id: id }, {
      status,
      updatedBy: {
        _id: user._id,
        email: user.email
      },
      $push: {
        history: {
          status: status,
          updateAt: new Date,
          updateBy: {
            _id: user._id,
            email: user.email

          }
        }
      }
    })

    return updateResume
  }

  async remove(id: string, user: IUser) {
    let update = await this.ResumeModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return await this.ResumeModel.softDelete({ _id: id })
  }
}
