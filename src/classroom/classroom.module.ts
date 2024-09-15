import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { Classroom, ClassroomSchema } from '../domains/schema/classroom.schema';
import { Subject, SubjectSchema } from '../domains/schema/subject.schema';
import { TimeTable, TimeTableSchema } from '../domains/schema/timetable.schema';
import { Attendance, AttendanceSchema } from '../domains/schema/attendance.schema';
import { Syllabus, SyllabusSchema } from '../domains/schema/syllabus.schema';
import { StudyMaterial, StudyMaterialSchema } from '../domains/schema/study-material.schema';
import { Result, ResultSchema } from '../domains/schema/result.schema';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Student, StudentSchema } from 'src/domains/schema/students.schema';
import { User, UserSchema } from 'src/domains/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Classroom.name, schema: ClassroomSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: TimeTable.name, schema: TimeTableSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: Syllabus.name, schema: SyllabusSchema },
      { name: StudyMaterial.name, schema: StudyMaterialSchema },
      { name: Result.name, schema: ResultSchema },
      { name: Student.name, schema: StudentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService, RolesGuard],
})
export class ClassroomModule {}