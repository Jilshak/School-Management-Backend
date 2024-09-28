import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/domains/schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService,@InjectModel(User.name) private userModel:Model<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const userDetail = await this.userModel.findById(payload.sub)
    const loginUser = {
      userId: userDetail._id,
      username: userDetail.username,
      roles: userDetail.roles,
      schoolId: userDetail.schoolId,
      classId: userDetail.classId
    };
    return { ...loginUser }  }
}