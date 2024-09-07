import { BadRequestException, Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from "bcrypt"
import { signUpDto } from './dto/signup-auth.dto';
import { User } from 'src/domains/schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async signUp(signUpData: signUpDto): Promise<User> {
    const { email, password, name, isActive, schoolId, roleId, userType } = signUpData;

    // Check if user already exists
    const existingUser = await this.UserModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new this.UserModel({
      email,
      password: hashedPassword,
      name,
      isActive,
      schoolId,
      roleId,
      userType
    });

    try {
      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async signIn(email: string, password: string) {
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
