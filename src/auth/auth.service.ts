import { HttpException, Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Model } from 'mongoose';
import { UsersDocument, Users } from 'src/users/schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<UsersDocument>,
  ) {}

  async register(userObject: RegisterAuthDto) {
    const { password } = userObject;
    const plainToHash = await bcrypt.hash(password, 10);
    userObject = { ...userObject, password: plainToHash };
    return await this.userModel.create(userObject);
  }

  async login(userObject: LoginAuthDto) {
    const { email, password } = userObject;
    const findUser = await this.userModel.findOne({ email });

    if (!findUser) new HttpException('USER_NOT_FOUND', 404);

    const checkPassword = await bcrypt.compare(password, findUser.password);

    if (!checkPassword) new HttpException('PASSWORD_INCORRECT', 403);

    return findUser;
  }
}
