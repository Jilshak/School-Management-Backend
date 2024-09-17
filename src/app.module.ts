import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { SchoolModule } from './school/school.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TimetableModule } from './timetable/timetable.module';
import { UserModule } from './user/user.module';
import { ExamModule } from './exam/exam.module';
import { AccountsModule } from './accounts/accounts.module';
import { LibraryModule } from './library/library.module';
import { ClassroomModule } from './classroom/classroom.module';
import { OthersModule } from './others/others.module';
import { SchoolTypeModule } from './school-type/school-type.module';
import { AttendanceModule } from './attendance/attendance.module';
import { GuardsModule } from './guards/guards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    WinstonModule.forRoot({
      // ... (keep existing Winston configuration)
    }),
    GuardsModule,
    AuthModule,
    EmployeesModule,
    SchoolModule,
    SubjectsModule,
    TimetableModule,
    UserModule,
    ExamModule,
    AccountsModule,
    LibraryModule,
    ClassroomModule,
    OthersModule,
    SchoolTypeModule,
    AttendanceModule,
  ],
})
export class AppModule {}
