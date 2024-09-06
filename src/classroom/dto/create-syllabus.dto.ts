import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreateSyllabusDto {
  @ApiProperty({ description: 'The ID of the subject' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'The title of the syllabus' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the syllabus' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The list of topics covered in the syllabus', type: [String] })
  @IsArray()
  @IsString({ each: true })
  topics: string[];
}