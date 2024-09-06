import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsEnum } from 'class-validator';
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

class TimeSlot {
  @ApiProperty({ description: 'The start time of the slot' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'The end time of the slot' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ description: 'The subject ID for this time slot' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'The teacher ID for this time slot' })
  @IsNotEmpty()
  @IsString()
  teacherId: string;
}

class DaySchedule {
  @ApiProperty({ description: 'The day of the week', enum: DayOfWeek })
  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  @ApiProperty({ description: 'The time slots for this day', type: [TimeSlot] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  slots: TimeSlot[];
}

export class CreateTimetableDto {
  @ApiProperty({ description: 'The class or grade for this timetable' })
  @IsNotEmpty()
  @IsString()
  class: string;

  @ApiProperty({ description: 'The academic year for this timetable' })
  @IsNotEmpty()
  @IsString()
  academicYear: string;

  @ApiProperty({ description: 'The schedule for each day', type: [DaySchedule] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DaySchedule)
  schedule: DaySchedule[];
}