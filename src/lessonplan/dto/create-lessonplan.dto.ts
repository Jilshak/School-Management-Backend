import { Type } from 'class-transformer';
import { IsDateString, IsMongoId, IsArray, IsString, ValidateNested } from 'class-validator';

export class CreateLessonPlanDto {

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Entries)
  entries: Entries[];
}

class Entries {
  @IsMongoId()
  classroomId: string;

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
  chapters: string[];

  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @IsArray()
  @IsString({ each: true })
  corePoints: string[];

  @IsArray()
  @IsString({ each: true })
  evaluations: string[];

  @IsArray()
  @IsString({ each: true })
  learningOutcomes: string[];
}
