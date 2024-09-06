import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateStudyMaterialDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @IsNotEmpty()
  @IsUrl()
  fileUrl: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}