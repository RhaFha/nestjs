import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Model } from 'mongoose';
import { UsersDocument, Users } from 'src/users/schemas/users.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<UsersDocument>,
    private jwtService: JwtService,
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

    if (!findUser) throw new HttpException('USER_NOT_FOUND', 404);

    const checkPassword = await bcrypt.compare(password, findUser.password);

    if (!checkPassword)
      throw new HttpException('PASSWORD_INCORRECT', HttpStatus.FORBIDDEN);

    const payload = { id: findUser._id, name: findUser.name };
    const token = await this.jwtService.signAsync(payload);

    const data = {
      user: findUser,
      token: token,
    };

    return data;
  }
}
