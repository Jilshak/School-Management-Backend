import { IsNotEmpty, IsString, IsMongoId, IsArray } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty()
  @IsMongoId()
  schoolId: string;

  @IsNotEmpty()
  @IsString()
  className: string;

  @IsNotEmpty()
  @IsMongoId()
  classTeacherId: string;

  @IsNotEmpty()
  @IsString()
  classRoom: string;

  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  subjects: string[];
}