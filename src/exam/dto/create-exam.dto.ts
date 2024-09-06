import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExamType {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

export class CreateExamDto {
  @ApiProperty({ description: 'The name of the exam' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The subject ID of the exam' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'The date of the exam' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ description: 'The type of the exam', enum: ExamType })
  @IsNotEmpty()
  @IsEnum(ExamType)
  type: ExamType;

  @ApiProperty({ description: 'The duration of the exam in minutes' })
  @IsNotEmpty()
  @Type(() => Number)
  duration: number;
}