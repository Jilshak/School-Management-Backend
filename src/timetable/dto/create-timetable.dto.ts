import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested, IsEnum, IsOptional, IsNumber } from 'class-validator';
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
  @IsNumber()
  startTime: number;

  @ApiProperty({ description: 'The end time of the slot' })
  @IsNotEmpty()
  @IsNumber()
  endTime: number;

  @ApiProperty({ description: 'The subject ID for this time slot' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'The teacher ID for this time slot' })
  @IsNotEmpty()
  @IsString()
  teacherId: string;
}

export class CreateTimetableDto {
  @ApiProperty({ description: 'Classroom id' })
  @IsNotEmpty()
  @IsString()
  classId: string;

  @ApiProperty({ description: 'Schedule for Monday', type: [TimeSlot], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  monday?: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Tuesday', type: [TimeSlot], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  tuesday?: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Wednesday', type: [TimeSlot], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  wednesday?: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Thursday', type: [TimeSlot], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  thursday?: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Friday', type: [TimeSlot], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  friday?: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Saturday', type: [TimeSlot], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  saturday?: TimeSlot[];

  @ApiProperty({ description: 'Schedule for Sunday', type: [TimeSlot], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  sunday?: TimeSlot[];
}