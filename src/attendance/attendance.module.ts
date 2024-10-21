import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from 'src/domains/schema/attendance.schema';
import { Student, StudentSchema } from 'src/domains/schema/students.schema';
import { User, UserSchema } from 'src/domains/schema/user.schema';
import { Classroom, ClassroomSchema } from 'src/domains/schema/classroom.schema';
import { GuardsModule } from '../guards/guards.module';
import { Leave, LeaveSchema } from 'src/domains/schema/leave.schema';
import { NotificationService } from 'src/notification/notification.service';
import { WhatsAppService } from 'src/notification/whatsapp.service';
import { School, SchoolSchema } from 'src/domains/schema/school.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Student.name, schema: StudentSchema },
      { name: User.name, schema: UserSchema },
      { name: Classroom.name, schema: ClassroomSchema },
      { name: Leave.name, schema: LeaveSchema },
      { name: School.name, schema: SchoolSchema },
    ]),
    GuardsModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService,NotificationService,WhatsAppService],
})
export class AttendanceModule {}
