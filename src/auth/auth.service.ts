import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { User } from '../domains/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/domains/enums/user-roles.enum';
import { Classroom } from 'src/domains/schema/classroom.schema';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
    private jwtService: JwtService,
    @InjectConnection() private connection: Connection,
    private readonly notificationService: NotificationService
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

  async updateFcmToken(userId: Types.ObjectId, token: string) {
    try {
      const isTokenExists = await this.userModel.findOne({fcmToken:token})
      if(isTokenExists){
        this.userModel.updateOne({_id:userId},{$pull:{fcmToken:token}})
      }
       await this.userModel.updateOne(
        { _id: userId },
        { $addToSet: { fcmToken: token } }
      );
      this.notificationService.sendNotification(token, 'FCM Token Updated', 'Your FCM token has been updated');

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to update FCM token');
    }
  }


}
