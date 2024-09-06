import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsEnum, IsOptional } from 'class-validator';

enum StudyMaterialType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  LINK = 'link',
  OTHER = 'other'
}

export class CreateStudyMaterialDto {
  @ApiProperty({ description: 'The title of the study material' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the study material' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The type of study material', enum: StudyMaterialType })
  @IsNotEmpty()
  @IsEnum(StudyMaterialType)
  type: StudyMaterialType;

  @ApiProperty({ description: 'The URL or file path of the study material' })
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'The ID of the subject this material is for' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'Additional notes about the study material', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}