import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../domains/schema/user.schema';
import { AuthController } from './auth.controller';
import {
  Classroom,
  ClassroomSchema,
} from 'src/domains/schema/classroom.schema';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Classroom.name, schema: ClassroomSchema },
    ]),
  ],
  providers: [AuthService, JwtStrategy,NotificationService],
  exports: [AuthService, PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
