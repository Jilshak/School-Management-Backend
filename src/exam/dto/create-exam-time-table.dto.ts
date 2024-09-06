import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class ExamScheduleItem {
  @ApiProperty({ description: 'The exam ID' })
  @IsNotEmpty()
  @IsString()
  examId: string;

  @ApiProperty({ description: 'The start time of the exam' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ description: 'The end time of the exam' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endTime: Date;
}

export class CreateExamTimeTableDto {
  @ApiProperty({ description: 'The name of the exam time table' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The class or batch ID' })
  @IsNotEmpty()
  @IsString()
  classId: string;

  @ApiProperty({ description: 'The exam schedule', type: [ExamScheduleItem] })
  @IsArray()
  @Type(() => ExamScheduleItem)
  schedule: ExamScheduleItem[];
}