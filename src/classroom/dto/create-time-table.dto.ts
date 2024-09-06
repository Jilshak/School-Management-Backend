import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}

export class CreateTimeTableDto {
  @ApiProperty({ description: 'The ID of the subject' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'The ID of the classroom' })
  @IsNotEmpty()
  @IsString()
  classroomId: string;

  @ApiProperty({ description: 'The day of the week', enum: DayOfWeek })
  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'The start time of the class' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ description: 'The end time of the class' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ description: 'The ID of the teacher' })
  @IsNotEmpty()
  @IsString()
  teacherId: string;
}