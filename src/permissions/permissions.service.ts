import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { exists } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {

  constructor(@InjectModel(Permission.name) private PermissionModel: SoftDeleteModel<PermissionDocument>) { }
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { name, apiPath, method, module } = createPermissionDto
    const checkCondition = await this.PermissionModel.findOne({ apiPath: apiPath, method: method })
    if (checkCondition) {
      throw new BadRequestException(`Permision với apiPath=${apiPath}, method=${method} đã tồn tại`)
    }
    const newPermission = await this.PermissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newPermission.id,
      createdAt: newPermission.createdAt
    }
  }

  async findAll(CurrentPage: number, limit: number, qs: string) {
    const { filter, skip, sort, population } = aqp(qs);
    delete filter.current,
      delete filter.pageSize

    let offset = (+CurrentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.PermissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.PermissionModel.find(filter)
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
    return await this.PermissionModel.findById(id)
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    return await this.PermissionModel.updateOne({ _id: id }, {
      ...updatePermissionDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async remove(id: string, user: IUser) {
    await this.PermissionModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return await this.PermissionModel.softDelete({ _id: id })
  }
}
