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
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentDueCron } from './domains/crons/payment-due.service';
import { NotificationService } from './notification/notification.service';
import { Account, AccountSchema } from './domains/schema/account.schema';
import { FeeType, FeeTypeSchema } from './domains/schema/feeType.schema';
import { PaymentDue, PaymentDueSchema } from './domains/schema/paymentdue.schema';
import { FeeStructure, FeeStructureSchema } from './domains/schema/fee-structure.schema';
import { User, UserSchema } from './domains/schema/user.schema';
import { Student, StudentSchema } from './domains/schema/students.schema';
import { School, SchoolSchema } from './domains/schema/school.schema';
import { EventService } from './event/event.service';
import { EventController } from './event/event.controller';
import { EventModule } from './event/event.module';
import { WhatsAppService } from './notification/whatsapp.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
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
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: FeeType.name, schema: FeeTypeSchema },
      { name: PaymentDue.name, schema: PaymentDueSchema },
      { name: FeeStructure.name, schema: FeeStructureSchema },
      { name: User.name, schema: UserSchema },
      { name: Student.name, schema: StudentSchema },
      { name: School.name, schema: SchoolSchema },

    ]),
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
    EventModule,
  ],
  providers:[PaymentDueCron, NotificationService, WhatsAppService],
  controllers: []
})
export class AppModule {}
