import { IsDateString, IsMongoId, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class EntryDto {
  @IsMongoId()
  teacherId: string;

  @IsMongoId()
  subjectId: string;

  @IsArray()
  @IsString({ each: true })
  topics: string[];

  @IsArray()
  @IsString({ each: true })
  activities: string[];

  @IsArray()
  @IsString({ each: true })
  homework: string[];
}

export class CreateClassDailyRecordDto {
  @IsDateString()
  date: string;

  @IsMongoId()
  classroomId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntryDto)
  entries: EntryDto[];
}
