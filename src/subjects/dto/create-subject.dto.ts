import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateSubjectDto {
  @IsNotEmpty()
  @IsString()
  subjectName: string;

  @IsNotEmpty()
  @IsMongoId()
  schoolId: string;
}