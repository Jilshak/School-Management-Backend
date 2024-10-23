import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassDailyRecordController } from './classdailyrecord.controller';
import { ClassDailyRecordService } from './classdailyrecord.service';
import { ClassDailyRecord, ClassDailyRecordSchema } from '../domains/schema/classDailyRecord.schema';
import { Classroom, ClassroomSchema } from '../domains/schema/classroom.schema';
import { Teacher, TeacherSchema } from '../domains/schema/teacher.schema';
import { Subject, SubjectSchema } from '../domains/schema/subject.schema';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassDailyRecord.name, schema: ClassDailyRecordSchema },
      { name: Classroom.name, schema: ClassroomSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Subject.name, schema: SubjectSchema },
    ]),
    GuardsModule,
  ],
  controllers: [ClassDailyRecordController],
  providers: [ClassDailyRecordService],
})
export class ClassDailyRecordModule {}
