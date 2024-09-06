import { IsNotEmpty, IsString, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class ScheduleItemDto {
  @IsNotEmpty()
  @IsString()
  period: string;

  @IsNotEmpty()
  @IsMongoId()
  subjectId: string;
}

export class CreateTimetableDto {
  @IsNotEmpty()
  @IsMongoId()
  classroomId: string;

  @IsNotEmpty()
  @IsString()
  day: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  schedule: ScheduleItemDto[];
}