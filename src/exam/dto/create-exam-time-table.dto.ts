import { IsNotEmpty, IsMongoId, IsDate, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExamScheduleDto {
  @IsNotEmpty()
  @IsMongoId()
  examId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endTime: Date;
}

export class CreateExamTimeTableDto {
  @IsNotEmpty()
  @IsMongoId()
  classId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamScheduleDto)
  schedule: ExamScheduleDto[];
}