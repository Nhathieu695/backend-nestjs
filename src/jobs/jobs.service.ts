import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, JobDocument } from './schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import { use } from 'passport';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { job } from 'cron';

@Injectable()
export class JobsService {


  constructor(@InjectModel(Job.name) private JobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(User.name) private UserModel: SoftDeleteModel<UserDocument>) { }
  async create(createJobDto: CreateJobDto, user: IUser) {
    const { name, skills, company, salary, quantity, level, description, startDate, endDate,
      location, isActive
    } = createJobDto
    let newJob = await this.JobModel.create(createJobDto)
    return {
      _id: newJob._id,
      createdAt: newJob.createdAt
    }
  }

  async findAll(CurrentPage: number, limit: number, qs: string) {
    const { filter, skip, sort, population } = aqp(qs);
    delete filter.current,
      delete filter.pageSize

    let offset = (+CurrentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.JobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.JobModel.find(filter)
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
    return await this.JobModel.findOne({ _id: id })
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {

    if (!mongoose.Types.ObjectId.isValid(id))
      return 'not found'
    let updateJob = await this.JobModel.updateOne({ _id: id }, {
      ...updateJobDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return updateJob
  }

  async remove(id: string, user: IUser) {

    if (!mongoose.Types.ObjectId.isValid(id))
      return 'not found'
    let upJob = await this.JobModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return await this.JobModel.softDelete({ _id: id })
  }
}
