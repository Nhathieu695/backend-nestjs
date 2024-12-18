import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private UserModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>) { }



  hashPassword = (password: string) => {

    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash
  }
  async create(createUserDto: CreateUserDto, user: IUser) {
    const { name, email, password, age, gender, address, role, company } = createUserDto
    const isExist = await this.UserModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại`)
    }
    const hashPassword = await this.hashPassword(createUserDto.password)
    let creatUser = await this.UserModel.create({
      name, email, password: hashPassword, age, gender, address, role, company,
      createdBy: {
        _id: user._id,
        name: user.name
      }
    })
    return {
      _id: creatUser?._id,
      createdAt: creatUser?.createdAt
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password, age, gender, address } = registerUserDto
    const isExist = await this.UserModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại`)
    }

    //fetch user role
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });
    const hashPassword = this.hashPassword(password)
    let user = await this.UserModel.create({
      name, email, password: hashPassword, age, gender, address, role: userRole._id
    })
    return user
  }

  async findAll(CurrentPage: number, limit: number, qs: string) {
    const { filter, skip, sort, population } = aqp(qs);
    delete filter.current,
      delete filter.pageSize

    let offset = (+CurrentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.UserModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.UserModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .select("-password")
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
    let getuser = (await this.UserModel.findOne({ _id: id }).select("-password")).populate({
      path: "role", select: { name: 1, _id: 1 }
    })
    return getuser
  }


  async findOneByUsername(username: string) {

    let getuser = await this.UserModel.findOne({ email: username }).populate({ path: "role", select: { name: 1 } })
    return getuser
  }


  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash)
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    let updated = await this.UserModel.updateOne({ _id: id }, {
      ...updateUserDto,
      updatedBy: {
        _id: user?._id,
        email: user?.email
      }
    })
    return updated
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return 'not found'
    const foundUser = await this.UserModel.findById(id);
    if (foundUser && foundUser.email === "admin@gmail.com") {
      throw new BadRequestException("Không thể xóa tài khoản admin@gmail.com");
    }
    let updateUser = await this.UserModel.updateOne({ _id: id }, {
      deletedBy: {
        _id: user._id,
        email: user.email
      }
    })
    let removeUser = await this.UserModel.softDelete({ _id: id })
    return removeUser
  }

  UpdateUserToken = async (refreshToken: string, _id: string) => {
    return await this.UserModel.updateOne({ _id: _id },
      { refreshToken }
    )
  }

  async findUserByToken(refreshToken: string) {
    let user = (await this.UserModel.findOne({ refreshToken })).populate({
      path: "role",
      select: { name: 1 }
    })
    return user
  }


}
