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
    ]),
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService, RolesGuard],
})
export class ClassroomModule {}