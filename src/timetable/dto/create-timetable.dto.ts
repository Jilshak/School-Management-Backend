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
  startTime: Date;

  @ApiProperty({ description: 'The end time of the slot' })
  @IsNotEmpty()
  @IsString()
  endTime: Date;

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
  @ApiProperty({ description: 'Classroom id' })
  @IsNotEmpty()
  @IsString()
  classId: string;


  @ApiProperty({ description: 'Schedule for Monday', type: [TimeSlot] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  monday: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Tuesday', type: [TimeSlot] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  tuesday: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Wednesday', type: [TimeSlot] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  wednesday: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Thursday', type: [TimeSlot] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  thursday: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Friday', type: [TimeSlot] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  friday: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Saturday', type: [TimeSlot] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  saturday: TimeSlot[];
}