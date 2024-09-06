import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { Exam, ExamSchema } from '../domains/schema/exam.schema';
import { ExamTimeTable, ExamTimeTableSchema } from '../domains/schema/exam-time-table.schema';
import { Result, ResultSchema } from '../domains/schema/result.schema';
import { RolesGuard } from '../shared/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamTimeTable.name, schema: ExamTimeTableSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
  ],
  controllers: [ExamController],
  providers: [ExamService, RolesGuard],
})
export class ExamModule {}