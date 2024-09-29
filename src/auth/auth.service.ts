import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { User } from '../domains/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/domains/enums/user-roles.enum';
import { Classroom } from 'src/domains/schema/classroom.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
    private jwtService: JwtService,
    @InjectConnection() private connection: Connection
  ) {}

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)&&user.isActive) {
      const { password, ...result } = user.toObject();
      if(user.roles.includes(UserRole.TEACHER)){
        const classTeacherOf =await this.classroomModel.findOne({classTeacherId:user._id})
        if(classTeacherOf){
          return {...result,classTacherOf: classTeacherOf._id}
        }
      }
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user?.username, sub: user?._id,role:user?.roles,classTeacherOf:user?.classTeacherOf,classId:user?.roles.includes('student') ? user.classId:undefined};
    return {
      access_token: this.jwtService.sign(payload,{secret:process.env.JWT_SECRET as string})
    };
  }


}
