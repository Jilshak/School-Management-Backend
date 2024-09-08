import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { EmployeesModule } from './employees/employees.module';
import { RolesModule } from './roles/roles.module';
import { SchoolModule } from './school/school.module';
import { StudentsModule } from './students/students.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TimetableModule } from './timetable/timetable.module';
import { UserModule } from './user/user.module';
import { ExamModule } from './exam/exam.module';
import { AccountsModule } from './accounts/accounts.module';
import { LibraryModule } from './library/library.module';
import { ClassroomModule } from './classroom/classroom.module';
import { OthersModule } from './others/others.module';
import { SchoolTypeModule } from './school-type/school-type.module';
import { AdmissionModule } from './admission/admission.module';

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
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ms }) => {
              return `${timestamp} [${context}] ${level}: ${message} ${ms}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    }),
    AuthModule,
    ClassesModule,
    EmployeesModule,
    RolesModule,
    SchoolModule,
    StudentsModule,
    SubjectsModule,
    TimetableModule,
    UserModule,
    ExamModule,
    AccountsModule,
    LibraryModule,
    ClassroomModule,
    OthersModule,
    SchoolTypeModule,
    AdmissionModule,
  ],
})
export class AppModule {}
