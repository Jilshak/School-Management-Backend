import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreateSyllabusDto {
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsArray()
  @IsString({ each: true })
  topics: string[];
}