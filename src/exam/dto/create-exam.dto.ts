import { IsNotEmpty, IsString, IsDate, IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExamType {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

export class CreateExamDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNotEmpty()
  @IsMongoId()
  subjectId: string;

  @IsNotEmpty()
  @IsMongoId()
  classId: string;

  @IsNotEmpty()
  @IsEnum(ExamType)
  type: ExamType;

  @IsNotEmpty()
  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  description?: string;
}