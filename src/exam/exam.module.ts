import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { Exam, ExamSchema } from '../domains/schema/exam.schema';
import { ExamTimeTable, ExamTimeTableSchema } from '../domains/schema/exam-time-table.schema';
import { Result, ResultSchema } from '../domains/schema/result.schema';
import { GuardsModule } from '../guards/guards.module';
import { SemExam, SemExamSchema } from '../domains/schema/sem-exam.schema';
import { ClassTest, ClassTestSchema } from 'src/domains/schema/class-test.schema';
import { TimeTable, TimeTableSchema } from 'src/domains/schema/timetable.schema';
import { Student, StudentSchema } from 'src/domains/schema/students.schema';
import { User, UserSchema } from 'src/domains/schema/user.schema';
import { Classroom, ClassroomSchema } from 'src/domains/schema/classroom.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamTimeTable.name, schema: ExamTimeTableSchema },
      { name: Result.name, schema: ResultSchema },
      { name: SemExam.name, schema: SemExamSchema },
      { name: TimeTable.name, schema: TimeTableSchema },
      { name: ClassTest.name, schema: ClassTestSchema },
      { name: Student.name, schema: StudentSchema },
      { name: User.name, schema: UserSchema },
      { name: Classroom.name, schema: ClassroomSchema },
    ]),
    GuardsModule,
  ],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}