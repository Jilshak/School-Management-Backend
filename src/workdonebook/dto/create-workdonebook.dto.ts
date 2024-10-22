import { IsDateString, IsMongoId, IsArray, IsString } from 'class-validator';

export class CreateWorkDoneBookDto {
  @IsMongoId()
  classroomId: string;

  @IsMongoId()
  subjectId: string;

  @IsDateString()
  date: string;

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
