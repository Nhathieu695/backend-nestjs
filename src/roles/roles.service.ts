import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {

  constructor(@InjectModel(Role.name) private RolenModel: SoftDeleteModel<RoleDocument>) { }
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = createRoleDto
    // const checkCondition = await this.RolenModel.findOne({ name })
    // if (checkCondition) {
    //   throw new BadRequestException(`Role với name=${name} đã tồn tại`)
    // }
    const newRole = await this.RolenModel.create({
      ...createRoleDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newRole.id,
      createdAt: newRole.createdAt
    }
  }

  async findAll(CurrentPage: number, limit: number, qs: string) {
    const { filter, skip, sort, population, projection } = aqp(qs);
    delete filter.current,
      delete filter.pageSize

    let offset = (+CurrentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.RolenModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.RolenModel.find(filter)
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("not found role")
    }

    return (await this.RolenModel.findById(id)).populate({
      path: "permissions",
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 }
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    return await this.RolenModel.updateOne({ _id: id }, {
      ...updateRoleDto,
      updatedBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async remove(id: string, user: IUser) {
    const foundRole = await this.RolenModel.findById(id);
    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException("Không thể xóa role ADMIN");
    }
    await this.RolenModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    return await this.RolenModel.softDelete({ _id: id })
  }
}
